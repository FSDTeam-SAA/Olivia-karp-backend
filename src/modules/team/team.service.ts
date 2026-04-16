import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { uploadToCloudinary } from "../../utils/cloudinary";
import Team from "./team.model";
import { ISocialLink } from "./team.interface";

const createNewTeamMember = async (
  payload: any,
  files: Record<string, Express.Multer.File[]> | undefined,
) => {
  let socialLinks: ISocialLink[] = [];

  // 1. Handle JSON string fallback if provided
  if (payload.socialLinks) {
    try {
      const parsed =
        typeof payload.socialLinks === "string"
          ? JSON.parse(payload.socialLinks)
          : payload.socialLinks;
      if (Array.isArray(parsed)) {
        socialLinks = [...parsed];
      }
    } catch (error) {
      // Ignore parse errors, continue with individual fields
    }
  }

  // 2. Handle "One by One" fields from payload (e.g., linkedin, instagram)
  // Standardize common platforms
  const platforms = [
    "linkedIn",
    "instagram",
    "facebook",
    "twitter",
    "x",
    "youtube",
    "website",
  ];

  platforms.forEach((p) => {
    if (payload[p]) {
      // Avoid duplicates if already in socialLinks from JSON
      const exists = socialLinks.some(
        (link) => link.platform.toLowerCase() === p.toLowerCase(),
      );
      if (!exists) {
        socialLinks.push({ platform: p, url: payload[p] });
      }
    }
  });

  let profilePicture;

  if (files && files.profilePicture && files.profilePicture.length > 0) {
    const pfpFile = files.profilePicture[0];
    const cloudinaryResult = await uploadToCloudinary(pfpFile.path, "team");

    profilePicture = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };
  }

  const teamData = {
    ...payload,
    socialLinks,
    profilePicture,
  };

  const result = await Team.create(teamData);
  return result;
};

const getAllTeamMembers = async (query: Record<string, any>) => {
  const { page = 1, limit = 10, searchTerm, sort } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { designation: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Team.find(filter)
      .sort(sort ? sort : { createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Team.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
  };
};

const getSingleTeamMember = async (id: string) => {
  const result = await Team.findById(id).lean();
  if (!result) throw new AppError("Team member not found", httpStatus.NOT_FOUND);
  return result;
};

const updateTeamMember = async (
  id: string,
  payload: any,
  files: Record<string, Express.Multer.File[]> | undefined,
) => {
  const teamMember = await Team.findById(id);

  if (!teamMember) {
    throw new AppError("Team member not found", httpStatus.NOT_FOUND);
  }

  let socialLinksData: ISocialLink[] = [...teamMember.socialLinks];

  // 1. Handle JSON string fallback if provided
  if (payload.socialLinks) {
    try {
      const parsed =
        typeof payload.socialLinks === "string"
          ? JSON.parse(payload.socialLinks)
          : payload.socialLinks;
      if (Array.isArray(parsed)) {
        socialLinksData = parsed;
      }
    } catch (error) {
      // Ignore parse errors
    }
  }

  // 2. Handle "One by One" updates
  const platforms = [
    "linkedIn",
    "instagram",
    "facebook",
    "twitter",
    "x",
    "youtube",
    "website",
  ];

  platforms.forEach((p) => {
    if (payload[p] !== undefined) {
      // If it's an empty string, we might want to remove it, but usually, we just update/add
      const existingIndex = socialLinksData.findIndex(
        (link) => link.platform.toLowerCase() === p.toLowerCase(),
      );

      if (payload[p] === "" || payload[p] === null) {
        // Remove if empty
        if (existingIndex > -1) {
          socialLinksData.splice(existingIndex, 1);
        }
      } else {
        // Update or Add
        if (existingIndex > -1) {
          socialLinksData[existingIndex].url = payload[p];
        } else {
          socialLinksData.push({ platform: p, url: payload[p] });
        }
      }
    }
  });

  let profilePicture = teamMember.profilePicture;

  if (files && files.profilePicture && files.profilePicture.length > 0) {
    const pfpFile = files.profilePicture[0];
    const cloudinaryResult = await uploadToCloudinary(pfpFile.path, "team");

    profilePicture = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };
  }

  const updatedData = {
    ...payload,
    socialLinks: socialLinksData,
    profilePicture,
  };

  const result = await Team.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteTeamMember = async (id: string) => {
  const teamMember = await Team.findById(id);

  if (!teamMember) {
    throw new AppError("Team member not found", httpStatus.NOT_FOUND);
  }

  await Team.findByIdAndDelete(id);
  return { message: "Team member successfully deleted" };
};

const teamService = {
  createNewTeamMember,
  getAllTeamMembers,
  getSingleTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

export default teamService;
