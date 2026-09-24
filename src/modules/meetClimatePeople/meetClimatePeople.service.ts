import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import logger from "../../logger";
import config from "../../config";
import { User } from "../user/user.model";
import Survey from "../survey/survey.model";
import { MeetClimateProfile } from "./meetClimatePeople.model";
import { IProfileQueryParams } from "./meetClimatePeople.interface";
import { mightyNetworksClient, MNMember } from "./mightyNetworks.client";

interface ISyncResult {
  totalFetched: number;
  created: number;
  updated: number;
  deactivated: number;
  lastSyncedAt: Date;
}

let lastSyncTelemetry: ISyncResult | null = null;

const syncMembersFromMighty = async (): Promise<ISyncResult> => {
  logger.info("[MeetClimatePeopleSync] Starting sync with Mighty Networks API...");

  const members = await mightyNetworksClient.fetchAllMembers();
  const totalFetched = members.length;

  if (totalFetched === 0) {
    const emptyResult: ISyncResult = {
      totalFetched: 0,
      created: 0,
      updated: 0,
      deactivated: 0,
      lastSyncedAt: new Date(),
    };
    lastSyncTelemetry = emptyResult;
    return emptyResult;
  }

  // Collect all identifiers for batch lookup
  const mightyMemberIds = members.map((m) => String(m.id));
  const emails = members
    .map((m) => (m.email || "").toLowerCase().trim())
    .filter((e) => Boolean(e));

  // Batch lookup all existing records in 3 fast queries
  const [existingProfiles, localUsers, localSurveys] = await Promise.all([
    MeetClimateProfile.find({ mightyMemberId: { $in: mightyMemberIds } }),
    User.find({
      $or: [
        { email: { $in: emails } },
        { mightyMemberId: { $in: mightyMemberIds } },
      ],
    }),
    Survey.find({ email: { $in: emails } }),
  ]);

  // Map for O(1) lookups
  const profileMap = new Map(existingProfiles.map((p) => [p.mightyMemberId, p]));
  const userMapByEmail = new Map(localUsers.map((u) => [u.email?.toLowerCase().trim(), u]));
  const userMapByMightyId = new Map(
    localUsers.filter((u) => u.mightyMemberId).map((u) => [u.mightyMemberId, u])
  );
  const surveyMapByEmail = new Map(
    localSurveys.map((s) => [s.email?.toLowerCase().trim(), s])
  );

  let created = 0;
  let updated = 0;
  const bulkOps: any[] = [];
  const userUpdateOps: any[] = [];

  for (const mnMember of members) {
    const mightyMemberId = String(mnMember.id);
    const normalizedEmail = (mnMember.email || "").toLowerCase().trim();

    // Match local user
    const localUser =
      userMapByMightyId.get(mightyMemberId) ||
      (normalizedEmail ? userMapByEmail.get(normalizedEmail) : null);

    // Match survey
    const localSurvey = normalizedEmail ? surveyMapByEmail.get(normalizedEmail) : null;

    // Compute profile fields
    const fullName =
      `${mnMember.first_name || ""} ${mnMember.last_name || ""}`.trim() ||
      (localUser ? `${localUser.firstName || ""} ${localUser.lastName || ""}`.trim() : "Community Member");

    const avatarUrl =
      mnMember.avatar ||
      localUser?.image?.url ||
      "";

    const locationStr =
      mnMember.location ||
      (localSurvey ? `${localSurvey.city}, ${localSurvey.country}` : localUser?.location) ||
      "";

    const bioText =
      (mnMember.bio && mnMember.bio.trim()) ||
      localSurvey?.tellAbout ||
      localSurvey?.message ||
      "Passionate about climate action and building a sustainable future.";

    const defaultTitle = localSurvey?.climateJourney || "Climate Community Member";
    const defaultOrg = localSurvey?.hubs || "Act on Climate Community";

    const climateInterests =
      localSurvey?.interest && localSurvey.interest.length > 0
        ? localSurvey.interest
        : ["Climate Action", "Sustainability"];

    const professionalAreas =
      localSurvey?.goals && localSurvey.goals.length > 0
        ? localSurvey.goals
        : ["Climate Impact"];

    const lookingFor =
      localSurvey?.whatLooking && localSurvey.whatLooking.length > 0
        ? localSurvey.whatLooking
        : ["Networking", "Collaboration"];

    const canHelpWith = localSurvey?.opportunity
      ? [localSurvey.opportunity]
      : ["Knowledge Sharing", "Community Support"];

    const skills =
      localSurvey?.interest && localSurvey.interest.length > 0
        ? localSurvey.interest
        : ["Sustainability Strategy", "Climate Solutions"];

    const areasOfExpertise =
      localSurvey?.interest && localSurvey.interest.length > 0
        ? localSurvey.interest
        : ["Climate Action"];

    const linkedinLink = localSurvey?.link || "";
    const permalink =
      mnMember.permalink ||
      `${config.mighty.mighty_community_url || "https://act-on-climate-community.mn.co"}/members/${mightyMemberId}`;

    const existingProfile = profileMap.get(mightyMemberId);

    if (!existingProfile) {
      created++;
      bulkOps.push({
        insertOne: {
          document: {
            mightyMemberId,
            name: fullName,
            firstName: mnMember.first_name || localUser?.firstName || "",
            lastName: mnMember.last_name || localUser?.lastName || "",
            email: normalizedEmail || localUser?.email || undefined,
            professionalTitle: defaultTitle,
            organization: defaultOrg,
            about: bioText,
            climateInterests,
            professionalAreas,
            education: [],
            experience: [],
            skills,
            areasOfExpertise,
            lookingFor,
            canHelpWith,
            linkedin: linkedinLink,
            website: "",
            portfolio: "",
            profileImage: avatarUrl,
            location: locationStr,
            mightyPermalink: permalink,
            isVisible: true,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          },
        },
      });
    } else {
      updated++;
      bulkOps.push({
        updateOne: {
          filter: { _id: existingProfile._id },
          update: {
            $set: {
              name: fullName,
              firstName: mnMember.first_name || existingProfile.firstName,
              lastName: mnMember.last_name || existingProfile.lastName,
              email: normalizedEmail || existingProfile.email,
              profileImage: avatarUrl || existingProfile.profileImage,
              location: locationStr || existingProfile.location,
              about:
                existingProfile.about &&
                existingProfile.about !== "Passionate about climate action and building a sustainable future."
                  ? existingProfile.about
                  : bioText,
              professionalTitle:
                existingProfile.professionalTitle &&
                existingProfile.professionalTitle !== "Climate Community Member"
                  ? existingProfile.professionalTitle
                  : defaultTitle,
              organization:
                existingProfile.organization &&
                existingProfile.organization !== "Act on Climate Community"
                  ? existingProfile.organization
                  : defaultOrg,
              climateInterests:
                existingProfile.climateInterests && existingProfile.climateInterests.length > 0
                  ? existingProfile.climateInterests
                  : climateInterests,
              professionalAreas:
                existingProfile.professionalAreas && existingProfile.professionalAreas.length > 0
                  ? existingProfile.professionalAreas
                  : professionalAreas,
              lookingFor:
                existingProfile.lookingFor && existingProfile.lookingFor.length > 0
                  ? existingProfile.lookingFor
                  : lookingFor,
              canHelpWith:
                existingProfile.canHelpWith && existingProfile.canHelpWith.length > 0
                  ? existingProfile.canHelpWith
                  : canHelpWith,
              skills:
                existingProfile.skills && existingProfile.skills.length > 0
                  ? existingProfile.skills
                  : skills,
              areasOfExpertise:
                existingProfile.areasOfExpertise && existingProfile.areasOfExpertise.length > 0
                  ? existingProfile.areasOfExpertise
                  : areasOfExpertise,
              linkedin: existingProfile.linkedin || linkedinLink,
              mightyPermalink: permalink,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            },
          },
        },
      });
    }

    if (localUser && (!localUser.mightyMemberId || localUser.mightyMemberId !== mightyMemberId)) {
      userUpdateOps.push({
        updateOne: {
          filter: { _id: localUser._id },
          update: {
            $set: {
              mightyMemberId,
              memberSince: localUser.memberSince || new Date(),
              role: localUser.role === "admin" ? "admin" : "member",
            },
          },
        },
      });
    }
  }

  // Execute bulk writes in single operations
  if (bulkOps.length > 0) {
    await MeetClimateProfile.bulkWrite(bulkOps, { ordered: false });
  }

  if (userUpdateOps.length > 0) {
    await User.bulkWrite(userUpdateOps, { ordered: false });
  }

  const result: ISyncResult = {
    totalFetched,
    created,
    updated,
    deactivated: 0,
    lastSyncedAt: new Date(),
  };

  lastSyncTelemetry = result;
  logger.info(
    `[MeetClimatePeopleSync] Completed: ${created} created, ${updated} updated, ${totalFetched} total.`
  );
  return result;
};

const getAllProfilesFromDB = async (query: IProfileQueryParams) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  // By default, only show visible profiles unless requested with all=true (for admin)
  if (query.all !== "true" && query.all !== true) {
    filter.isVisible = true;
  }

  // Multi-field text / keyword search
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { professionalTitle: searchRegex },
      { organization: searchRegex },
      { skills: searchRegex },
      { climateInterests: searchRegex },
      { areasOfExpertise: searchRegex },
      { location: searchRegex },
    ];
  }

  // Specific tag filters
  if (query.climateInterest && query.climateInterest.trim()) {
    filter.climateInterests = {
      $regex: new RegExp(`^${query.climateInterest.trim()}$`, "i"),
    };
  }

  if (query.professionalArea && query.professionalArea.trim()) {
    filter.professionalAreas = {
      $regex: new RegExp(`^${query.professionalArea.trim()}$`, "i"),
    };
  }

  if (query.lookingFor && query.lookingFor.trim()) {
    filter.lookingFor = {
      $regex: new RegExp(`^${query.lookingFor.trim()}$`, "i"),
    };
  }

  // Sorting
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sortCriteria: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  const [profiles, total] = await Promise.all([
    MeetClimateProfile.find(filter)
      .select("-email -__v")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean(),
    MeetClimateProfile.countDocuments(filter),
  ]);

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: profiles,
  };
};

const getProfileByIdFromDB = async (id: string) => {
  let profile = null;

  if (Types.ObjectId.isValid(id)) {
    profile = await MeetClimateProfile.findById(id).select("-email -__v").lean();
  }

  if (!profile) {
    profile = await MeetClimateProfile.findOne({ mightyMemberId: id })
      .select("-email -__v")
      .lean();
  }

  if (!profile) {
    throw new AppError("Climate member profile not found", StatusCodes.NOT_FOUND);
  }

  return profile;
};

const updateProfileVisibilityInDB = async (id: string, isVisible: boolean) => {
  let profile = null;

  if (Types.ObjectId.isValid(id)) {
    profile = await MeetClimateProfile.findByIdAndUpdate(
      id,
      { isVisible },
      { new: true }
    ).select("-email -__v");
  }

  if (!profile) {
    profile = await MeetClimateProfile.findOneAndUpdate(
      { mightyMemberId: id },
      { isVisible },
      { new: true }
    ).select("-email -__v");
  }

  if (!profile) {
    throw new AppError("Profile not found", StatusCodes.NOT_FOUND);
  }

  return profile;
};

const getSyncStatusFromDB = async () => {
  const [totalCount, visibleCount, hiddenCount, latestProfile] = await Promise.all([
    MeetClimateProfile.countDocuments(),
    MeetClimateProfile.countDocuments({ isVisible: true }),
    MeetClimateProfile.countDocuments({ isVisible: false }),
    MeetClimateProfile.findOne().sort({ lastSyncedAt: -1 }).select("lastSyncedAt").lean(),
  ]);

  return {
    totalProfiles: totalCount,
    visibleProfiles: visibleCount,
    hiddenProfiles: hiddenCount,
    lastSyncedAt: latestProfile?.lastSyncedAt || lastSyncTelemetry?.lastSyncedAt || null,
    lastSyncStats: lastSyncTelemetry,
  };
};

const handleMightyWebhook = async (payload: any) => {
  const event = payload?.event || payload?.action || payload?.type;
  const memberData: MNMember = payload?.data?.member || payload?.member || payload;

  if (!memberData?.id) {
    logger.warn("[MeetClimatePeopleWebhook] Received webhook payload without member id:", payload);
    return { received: true, action: "ignored" };
  }

  const mightyMemberId = String(memberData.id);

  if (event === "MemberLeft" || event === "member_left" || event === "MemberDeleted") {
    await MeetClimateProfile.findOneAndUpdate(
      { mightyMemberId },
      { isVisible: false, syncStatus: "manual" }
    );
    return { received: true, action: "profile_hidden" };
  }

  // For joined/updated events, trigger a profile sync for this member
  const fullName = `${memberData.first_name || ""} ${memberData.last_name || ""}`.trim();
  const normalizedEmail = (memberData.email || "").toLowerCase().trim();

  await MeetClimateProfile.findOneAndUpdate(
    { mightyMemberId },
    {
      $set: {
        name: fullName || "Community Member",
        firstName: memberData.first_name,
        lastName: memberData.last_name,
        email: normalizedEmail || undefined,
        location: memberData.location || "",
        about: memberData.bio || "Passionate about climate action and building a sustainable future.",
        profileImage: memberData.avatar || "",
        mightyPermalink: memberData.permalink,
        lastSyncedAt: new Date(),
        syncStatus: "synced",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { received: true, action: "profile_synced" };
};

export const meetClimatePeopleService = {
  syncMembersFromMighty,
  getAllProfilesFromDB,
  getProfileByIdFromDB,
  updateProfileVisibilityInDB,
  getSyncStatusFromDB,
  handleMightyWebhook,
};
