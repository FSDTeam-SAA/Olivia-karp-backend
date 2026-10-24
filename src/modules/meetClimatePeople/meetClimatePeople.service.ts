import fs from "fs";
import { skillsSchema } from "./meetClimatePeople.validation";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import logger from "../../logger";
import config from "../../config";
import { User } from "../user/user.model";
import { USER_ROLE } from "../user/user.constant";
import PurchaseSubscription from "../purchaseSubscription/purchaseSubscription.model";
import Survey from "../survey/survey.model";
import { MeetClimateProfile } from "./meetClimatePeople.model";
import { IMeetClimateProfile, IProfileQueryParams } from "./meetClimatePeople.interface";
import { mightyNetworksClient, MNMember } from "./mightyNetworks.client";
import { uploadToCloudinary } from "../../utils/cloudinary";

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

export const SAMPLE_DUMMY_PROFILES = [
  {
    name: "Dr. Maya Patel",
    professionalTitle: "Renewable Energy & Grid Integration Strategist",
    organization: "CleanPower Analytics",
    location: "London, UK",
    about: "Over 10 years working on microgrid decentralization, solar PV forecasting, and green hydrogen supply chains.",
    climateInterests: ["Renewable Energy", "CleanTech", "Energy Transition"],
    professionalAreas: ["Engineering", "Research"],
    skills: ["Grid Modeling", "Python", "Solar PV", "Policy Advisory"],
    areasOfExpertise: ["Microgrids", "Energy Storage", "Decarbonization"],
    education: [{ school: "Imperial College London", degree: "Ph.D. in Electrical & Energy Engineering", year: "2018" }],
    experience: [{ title: "Lead Grid Strategist", company: "CleanPower Analytics", duration: "2021 - Present" }],
    excitingProjects: ["Western European Zero-Carbon Microgrid Pilot 2026", "Open-Source Solar Yield Analytics Engine"],
    howToConnect: "Open for clean-tech startup advisory, podcast interviews, and university guest lectures.",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "Marcus Vance",
    professionalTitle: "ESG Reporting & Carbon Accounting Lead",
    organization: "Verde Carbon Solutions",
    location: "Berlin, Germany",
    about: "Helping corporate enterprises navigate CSRD, Scope 1-3 GHG protocols, and Science-Based Targets (SBTi).",
    climateInterests: ["Carbon Accounting", "ESG", "Sustainable Finance"],
    professionalAreas: ["Finance", "Corporate Strategy"],
    skills: ["GHG Protocol", "CSRD", "Life Cycle Assessment", "Financial Modeling"],
    areasOfExpertise: ["Carbon Auditing", "Corporate Sustainability", "Supply Chain Decarbonization"],
    education: [{ school: "Mannheim Business School", degree: "M.Sc. in Sustainable Management", year: "2019" }],
    experience: [{ title: "Head of ESG Assurance", company: "Verde Carbon Solutions", duration: "2022 - Present" }],
    excitingProjects: ["Supply Chain Scope 3 Carbon Tracker", "Circular Packaging Transition Playbook"],
    howToConnect: "Open to connect with ESG leaders, carbon accounting software founders, and corporate sustainability heads.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "Elena Rostova",
    professionalTitle: "Circular Economy & Sustainable Product Designer",
    organization: "Loop Systems Collective",
    location: "Amsterdam, Netherlands",
    about: "Passionate about zero-waste materials, bio-composites, and extended producer responsibility (EPR).",
    climateInterests: ["Circular Economy", "Zero Waste", "Sustainable Materials"],
    professionalAreas: ["Design", "Sustainability"],
    skills: ["Material Flow Analysis", "CAD", "Bio-plastics", "Lifecycle Assessment"],
    areasOfExpertise: ["Cradle to Cradle Design", "Post-Consumer Recycling", "Ecodesign"],
    education: [{ school: "TU Delft", degree: "M.Sc. in Industrial Design Engineering", year: "2020" }],
    experience: [{ title: "Principal Circular Designer", company: "Loop Systems Collective", duration: "2021 - Present" }],
    excitingProjects: ["Closed-Loop Textile Recycling Consortium", "Biodegradable Consumer Packaging Sprint"],
    howToConnect: "Happy to collaborate on circular product designs, bio-materials research, and startup advisory.",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "David Chen",
    professionalTitle: "Climate Tech Venture Associate & Investor",
    organization: "Terra Capital",
    location: "San Francisco, CA",
    about: "Investing in early-stage pre-seed & seed climate software, carbon removal technologies, and fusion energy.",
    climateInterests: ["Climate Tech", "Venture Capital", "Carbon Removal"],
    professionalAreas: ["Venture Capital", "Tech"],
    skills: ["Due Diligence", "Financial Modeling", "Market Analysis", "Valuation"],
    areasOfExpertise: ["Direct Air Capture", "Early-Stage Funding", "Climate Fintech"],
    education: [{ school: "UC Berkeley", degree: "B.S. in Environmental Economics", year: "2019" }],
    experience: [{ title: "Investment Associate", company: "Terra Capital", duration: "2022 - Present" }],
    excitingProjects: ["Annual Climate Tech Early-Stage Map", "Venture Fellowship for Climate Founders"],
    howToConnect: "Always excited to meet climate tech founders raising pre-seed and seed rounds.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "Amara Okafor",
    professionalTitle: "Nature-Based Solutions & Agroforestry Specialist",
    organization: "Regen Earth Initiative",
    location: "Nairobi, Kenya",
    about: "Dedicated to regenerative agriculture, soil carbon sequestration, and community-led reforestation.",
    climateInterests: ["Biodiversity", "Agroforestry", "Nature-Based Solutions"],
    professionalAreas: ["Agriculture", "Conservation"],
    skills: ["GIS Mapping", "Soil Carbon Monitoring", "Community Organizing", "Reforestation"],
    areasOfExpertise: ["Carbon Credits", "Agroecology", "Indigenous Land Stewardship"],
    education: [{ school: "University of Nairobi", degree: "M.Sc. in Agroforestry & Rural Development", year: "2018" }],
    experience: [{ title: "Senior Project Lead", company: "Regen Earth Initiative", duration: "2020 - Present" }],
    excitingProjects: ["Sub-Saharan Agroforestry Carbon Credit Initiative", "Community Seed Vaults Network"],
    howToConnect: "Open for research partnerships, nature-based project advisory, and fellowship mentoring.",
    profileImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "Liam O'Connor",
    professionalTitle: "Clean Mobility & EV Infrastructure Lead",
    organization: "VoltTransit Solutions",
    location: "Dublin, Ireland",
    about: "Specializing in municipal fleet electrification, heavy-duty EV charging hubs, and smart grid orchestration.",
    climateInterests: ["Clean Mobility", "EVs", "Smart Cities"],
    professionalAreas: ["Transportation", "Clean Energy"],
    skills: ["Fleet Modeling", "Grid Interconnection", "Urban Planning", "IoT"],
    areasOfExpertise: ["EV Charging Stations", "Public Transit Decarbonization", "Vehicle-to-Grid (V2G)"],
    education: [{ school: "Trinity College Dublin", degree: "B.A.I. Mechanical & Energy Engineering", year: "2017" }],
    experience: [{ title: "Technical Director", company: "VoltTransit Solutions", duration: "2021 - Present" }],
    excitingProjects: ["Zero-Emission Municipal Bus Fleet Roadmap", "Smart V2G Depot Optimization"],
    howToConnect: "Connect for fleet electrification advisory, transit summit panels, and clean mobility consulting.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "Aisha Al-Mansoor",
    professionalTitle: "Climate Policy Analyst & International Negotiator",
    organization: "Global Climate Action Council",
    location: "Geneva, Switzerland",
    about: "Working at the intersection of COP climate treaties, Article 6 carbon markets, and just transition frameworks.",
    climateInterests: ["Climate Policy", "Carbon Markets", "Just Transition"],
    professionalAreas: ["Policy", "International Relations"],
    skills: ["Policy Drafting", "Diplomacy", "International Law", "Article 6 Carbon"],
    areasOfExpertise: ["UNFCCC Processes", "Loss and Damage Finance", "Nationally Determined Contributions (NDCs)"],
    education: [{ school: "Geneva Graduate Institute", degree: "M.A. in International Affairs & Environmental Policy", year: "2019" }],
    experience: [{ title: "Senior Policy Advisor", company: "Global Climate Action Council", duration: "2021 - Present" }],
    excitingProjects: ["Bilateral Carbon Trading Agreement Framework", "Youth Climate Diplomacy Fellowship"],
    howToConnect: "Open to policy consultations, multilateral negotiations training, and youth mentorship.",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
  {
    name: "Carlos Mendoza",
    professionalTitle: "Industrial Decarbonization & Green Hydrogen Engineer",
    organization: "H2 Synergy Labs",
    location: "Santiago, Chile",
    about: "Developing green hydrogen electrolysis systems for mining and steel manufacturing in South America.",
    climateInterests: ["Green Hydrogen", "Heavy Industry", "Clean Energy"],
    professionalAreas: ["Engineering", "Energy"],
    skills: ["Electrolyzer Systems", "Thermodynamics", "Process Engineering", "Safety Compliance"],
    areasOfExpertise: ["Green Ammonia", "Mining Decarbonization", "Renewable Fuel Synthesis"],
    education: [{ school: "Pontificia Universidad Católica de Chile", degree: "B.Sc. in Chemical Engineering", year: "2018" }],
    experience: [{ title: "Lead Process Engineer", company: "H2 Synergy Labs", duration: "2021 - Present" }],
    excitingProjects: ["Solar-Powered Green Hydrogen Pilot in Atacama", "Zero-Emission Mining Haulage Feasibility"],
    howToConnect: "Connect for green hydrogen technical advisory, engineering collaborations, and keynote speaking.",
    profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    isVisible: true,
    syncStatus: "manual" as const,
    lastSyncedAt: new Date(),
  },
];

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

  let [profiles, total] = await Promise.all([
    MeetClimateProfile.find(filter)
      .select("-email -__v")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean(),
    MeetClimateProfile.countDocuments(filter),
  ]);

  // If no profiles exist in the database, automatically seed privacy-compliant dummy profiles
  if (
    total === 0 &&
    !query.search &&
    !query.climateInterest &&
    !query.professionalArea &&
    !query.lookingFor
  ) {
    try {
      await MeetClimateProfile.insertMany(SAMPLE_DUMMY_PROFILES);
      [profiles, total] = await Promise.all([
        MeetClimateProfile.find(filter)
          .select("-email -__v")
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .lean(),
        MeetClimateProfile.countDocuments(filter),
      ]);
    } catch {
      // Ignore seeding race conditions
    }
  }

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

const createOrUpdateMyProfileInDB = async (
  userId: string,
  payload: Partial<IMeetClimateProfile>,
  file?: Express.Multer.File
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User account not found", StatusCodes.NOT_FOUND);
  }

  // ── 1. Require Paid Membership Plan ───────────────────────────────────────
  const isPaidRole =
    user.role === USER_ROLE.ADMIN ||
    user.role === USER_ROLE.MEMBER ||
    user.role === USER_ROLE.ANNUAL_MEMBER ||
    user.role === USER_ROLE.MONTHLY_MEMBER ||
    user.role === USER_ROLE.BEGINNER_MEMBER ||
    (Boolean(user.role) && user.role !== USER_ROLE.NON_MEMBER);

  const hasMightyMembership = Boolean(user.mightyMemberId);

  let hasActiveSubscription = false;
  if (!isPaidRole && !hasMightyMembership) {
    const now = new Date();
    const activeSub = await PurchaseSubscription.findOne({
      userId: user._id,
      status: "active",
      expirationDate: { $gt: now },
    });
    hasActiveSubscription = Boolean(activeSub);
  }

  if (!isPaidRole && !hasMightyMembership && !hasActiveSubscription) {
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        // Ignore file cleanup error
      }
    }
    throw new AppError(
      "You need to choose a paid membership plan first",
      StatusCodes.FORBIDDEN
    );
  }

  let profileImageUrl = payload.profileImage;
  if (file?.path) {
    const uploadRes = await uploadToCloudinary(file.path, "meet-climate-people");
    profileImageUrl = uploadRes.secure_url;
  } else if (!profileImageUrl && user.image?.url) {
    profileImageUrl = user.image.url;
  }

  // Find existing profile by userId, or by user's email or mightyMemberId
  const query: Record<string, any>[] = [{ userId: user._id }];
  if (user.email) {
    query.push({ email: user.email.toLowerCase().trim() });
  }
  if (user.mightyMemberId) {
    query.push({ mightyMemberId: user.mightyMemberId });
  }

  let profile = await MeetClimateProfile.findOne({ $or: query });

  const resolvedName =
    payload.name?.trim() ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Act on Climate Member";

  const updateData: Partial<IMeetClimateProfile> = {
    userId: user._id,
    name: resolvedName,
    firstName: payload.firstName || user.firstName,
    lastName: payload.lastName || user.lastName,
    email: user.email?.toLowerCase().trim(),
    professionalTitle:
      payload.professionalTitle ||
      profile?.professionalTitle ||
      "Climate Community Member",
    organization:
      payload.organization ||
      profile?.organization ||
      "Act on Climate Community",
    about: payload.about !== undefined ? payload.about : profile?.about || "",
    climateInterests:
      payload.climateInterests !== undefined
        ? payload.climateInterests
        : profile?.climateInterests || [],
    professionalAreas:
      payload.professionalAreas !== undefined
        ? payload.professionalAreas
        : profile?.professionalAreas || [],
    education:
      payload.education !== undefined
        ? payload.education
        : profile?.education || [],
    experience:
      payload.experience !== undefined
        ? payload.experience
        : profile?.experience || [],
    skills: payload.skills !== undefined ? skillsSchema.parse(payload.skills) : profile?.skills || [],
    areasOfExpertise:
      payload.areasOfExpertise !== undefined
        ? payload.areasOfExpertise
        : profile?.areasOfExpertise || [],
    lookingFor:
      payload.lookingFor !== undefined
        ? payload.lookingFor
        : profile?.lookingFor || [],
    canHelpWith:
      payload.canHelpWith !== undefined
        ? payload.canHelpWith
        : profile?.canHelpWith || [],
    linkedin:
      payload.linkedin !== undefined ? payload.linkedin : profile?.linkedin || "",
    website:
      payload.website !== undefined ? payload.website : profile?.website || "",
    portfolio:
      payload.portfolio !== undefined
        ? payload.portfolio
        : profile?.portfolio || "",
    location:
      payload.location !== undefined
        ? payload.location
        : profile?.location || user.location || "",
    excitingProjects:
      payload.excitingProjects !== undefined
        ? payload.excitingProjects
        : profile?.excitingProjects || [],
    howToConnect:
      payload.howToConnect !== undefined
        ? payload.howToConnect
        : profile?.howToConnect || "",
    isVisible:
      payload.isVisible !== undefined
        ? payload.isVisible
        : profile?.isVisible ?? true,
    syncStatus: profile?.syncStatus || "manual",
    lastSyncedAt: new Date(),
  };

  if (user.mightyMemberId || profile?.mightyMemberId) {
    updateData.mightyMemberId = user.mightyMemberId || profile?.mightyMemberId;
  }

  if (profileImageUrl) {
    updateData.profileImage = profileImageUrl;
  }

  if (profile) {
    profile = await MeetClimateProfile.findByIdAndUpdate(
      profile._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-email -__v");
  } else {
    profile = await MeetClimateProfile.create(updateData);
  }

  return profile;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User account not found", StatusCodes.NOT_FOUND);
  }

  const query: Record<string, any>[] = [{ userId: user._id }];
  if (user.email) {
    query.push({ email: user.email.toLowerCase().trim() });
  }
  if (user.mightyMemberId) {
    query.push({ mightyMemberId: user.mightyMemberId });
  }

  const profile = await MeetClimateProfile.findOne({ $or: query })
    .select("-email -__v")
    .lean();
  return profile;
};

const deleteMyProfileInDB = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User account not found", StatusCodes.NOT_FOUND);
  }

  const query: Record<string, any>[] = [{ userId: user._id }];
  if (user.email) {
    query.push({ email: user.email.toLowerCase().trim() });
  }
  if (user.mightyMemberId) {
    query.push({ mightyMemberId: user.mightyMemberId });
  }

  const profile = await MeetClimateProfile.findOneAndDelete({ $or: query });
  if (!profile) {
    throw new AppError("Profile not found to delete", StatusCodes.NOT_FOUND);
  }
  return { deleted: true, id: profile._id };
};

const adminCreateProfileInDB = async (
  payload: Partial<IMeetClimateProfile>,
  file?: Express.Multer.File
) => {
  let profileImageUrl = payload.profileImage;
  if (file?.path) {
    const uploadRes = await uploadToCloudinary(file.path, "meet-climate-people");
    profileImageUrl = uploadRes.secure_url;
  }

  const profileData: any = {
    ...payload,
    skills: skillsSchema.parse(payload.skills ?? []),
    profileImage: profileImageUrl || payload.profileImage || "",
    syncStatus: payload.syncStatus || "manual",
    lastSyncedAt: new Date(),
    isVisible: payload.isVisible !== undefined ? payload.isVisible : true,
  };

  if (!profileData.mightyMemberId) {
    delete profileData.mightyMemberId;
  }

  const profile = await MeetClimateProfile.create(profileData);
  return profile;
};

const deleteProfileByIdFromDB = async (id: string) => {
  let profile = null;
  if (Types.ObjectId.isValid(id)) {
    profile = await MeetClimateProfile.findByIdAndDelete(id);
  }
  if (!profile) {
    profile = await MeetClimateProfile.findOneAndDelete({ mightyMemberId: id });
  }
  if (!profile) {
    throw new AppError("Profile not found to delete", StatusCodes.NOT_FOUND);
  }
  return { deleted: true, id: profile._id };
};

export const meetClimatePeopleService = {
  syncMembersFromMighty,
  getAllProfilesFromDB,
  getProfileByIdFromDB,
  updateProfileVisibilityInDB,
  getSyncStatusFromDB,
  handleMightyWebhook,
  createOrUpdateMyProfileInDB,
  getMyProfileFromDB,
  deleteMyProfileInDB,
  adminCreateProfileInDB,
  deleteProfileByIdFromDB,
};
