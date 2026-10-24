import { IOpportunity } from "./opportunity.interface";
import Opportunity from "./opportunity.model";
import { PartnerProfile } from "../educationPartner/educationPartner.model";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import logger from "../../logger";

const OPPORTUNITY_STATUSES = ["pending", "reviewed", "rejected"] as const;

const buildOpportunityFilter = (
  query: Record<string, any>,
  fixedStatus?: (typeof OPPORTUNITY_STATUSES)[number],
) => {
  const filter: Record<string, any> = {};
  const status = fixedStatus || query.status;
  const search = typeof query.search === "string" ? query.search.trim() : "";

  if (OPPORTUNITY_STATUSES.includes(status)) {
    filter.status = status;
  }

  if (
    typeof query.opportunityType === "string" &&
    query.opportunityType &&
    query.opportunityType !== "All"
  ) {
    const types = query.opportunityType
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    if (types.length === 1) {
      filter.opportunityType = { $regex: new RegExp(`^${types[0]}$`, "i") };
    } else if (types.length > 1) {
      filter.opportunityType = {
        $in: types.map((t: string) => new RegExp(`^${t}$`, "i")),
      };
    }
  }

  if (
    query.partnerOnly === "true" ||
    query.partnerOnly === true ||
    query.source === "partner"
  ) {
    filter.isPartnerOpportunity = true;
  } else if (query.source === "curated") {
    filter.isPartnerOpportunity = { $ne: true };
  }

  if (search) {
    filter.$or = ["title", "organizationName", "location", "shortDescription"].map(
      (field) => ({ [field]: { $regex: search, $options: "i" } }),
    );
  }

  return filter;
};


const submitOpportunityIntoDB = async (payload: IOpportunity) => {
  return await Opportunity.create(payload);
};

const submitPartnerOpportunityIntoDB = async (
  userId: string,
  payload: Omit<IOpportunity, "status" | "submittedBy" | "partnerId" | "isPartnerOpportunity" | "organizationName">,
) => {
  const partner = await PartnerProfile.findOne({ userId });
  const membershipExpired =
    partner?.membershipExpiresAt && partner.membershipExpiresAt < new Date();

  if (
    !partner ||
    partner.membershipStatus !== "active" ||
    !partner.isVerifiedPartner ||
    membershipExpired
  ) {
    throw new AppError(
      "An active, verified Education Partner membership is required to submit opportunities.",
      StatusCodes.FORBIDDEN,
    );
  }

  return Opportunity.create({
    ...payload,
    organizationName: partner.organizationName,
    submittedBy: userId,
    partnerId: partner._id,
    isPartnerOpportunity: true,
    status: "pending",
  });
};

/**
 * Retrieves paginated opportunities for Admin.
 * @param query - Contains page, limit, and potential filters
 */
const getAllOpportunitiesForAdmin = async (query: Record<string, any>) => {
  const { page = 1, limit = 10 } = query;

  // Calculate skip value
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;
  const filter = buildOpportunityFilter(query);

  // Execute Count and Find in parallel for better performance
  const [data, total] = await Promise.all([
    Opportunity.find(filter)
      .populate({
        path: "submittedBy",
        select: "name email role", // Security: only select necessary fields
      })
      .populate({
        path: "partnerId",
        select: "organizationName membershipStatus isVerifiedPartner",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(), // Performance: returns plain JS objects
    Opportunity.countDocuments(filter),
  ]);

  const totalPage = Math.ceil(total / limitNumber);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage,
    },
    data,
  };
};

const getPublishedOpportunities = async (query: Record<string, any>) => {
  const { page = 1, limit = 9 } = query;
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;
  const filter = buildOpportunityFilter(query, "reviewed");

  const [data, total] = await Promise.all([
    Opportunity.find(filter)
      .populate({
        path: "partnerId",
        select: "organizationName membershipStatus isVerifiedPartner organizationType slug",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Opportunity.countDocuments(filter),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};

const getMyPartnerOpportunities = async (userId: string, query: Record<string, any>) => {
  const { page = 1, limit = 10 } = query;
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;
  const filter = { submittedBy: userId, isPartnerOpportunity: true };

  const [data, total] = await Promise.all([
    Opportunity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber).lean(),
    Opportunity.countDocuments(filter),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};

const updateOpportunityStatus = async (id: string, status: string) => {
  return await Opportunity.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
};

const triggerPartnerOpportunityReindex = async () => {
  const reindexUrl = process.env.CHATBOT_REINDEX_URL;
  const apiKey = process.env.CHATBOT_ADMIN_API_KEY;

  if (!reindexUrl || !apiKey) {
    logger.warn(
      "Partner opportunity approved, but chatbot reindex was skipped because CHATBOT_REINDEX_URL or CHATBOT_ADMIN_API_KEY is not configured.",
    );
    return;
  }

  const response = await fetch(reindexUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ api_key: apiKey }).toString(),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new Error(`Chatbot reindex failed with status ${response.status}`);
  }
};

export const opportunityService = {
  submitOpportunityIntoDB,
  submitPartnerOpportunityIntoDB,
  getAllOpportunitiesForAdmin,
  getPublishedOpportunities,
  getMyPartnerOpportunities,
  updateOpportunityStatus,
  triggerPartnerOpportunityReindex,
  OPPORTUNITY_STATUSES,
};
