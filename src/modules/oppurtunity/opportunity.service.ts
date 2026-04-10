import { IOpportunity } from "./opportunity.intrface";
import Opportunity from "./opportunity.model";


const submitOpportunityIntoDB = async (payload: IOpportunity) => {
  return await Opportunity.create(payload);
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

  // Execute Count and Find in parallel for better performance
  const [data, total] = await Promise.all([
    Opportunity.find()
      .populate({
        path: "submittedBy",
        select: "name email role", // Security: only select necessary fields
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(), // Performance: returns plain JS objects
    Opportunity.countDocuments(),
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

const updateOpportunityStatus = async (id: string, status: string) => {
  return await Opportunity.findByIdAndUpdate(id, { status }, { new: true });
};

export const opportunityService = {
  submitOpportunityIntoDB,
  getAllOpportunitiesForAdmin,
  updateOpportunityStatus,
};