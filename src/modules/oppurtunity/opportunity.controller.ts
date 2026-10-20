import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { opportunityService } from "./opportunity.service";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

const submitOpportunity = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id; // From auth middleware if present
    const result = await opportunityService.submitOpportunityIntoDB({
        ...req.body,
        submittedBy: userId,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Opportunity submitted successfully. It will be reviewed within 48 hours.",
        data: result,
    });
});

const submitPartnerOpportunity = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)?._id || (req.user as any)?.id;
    const result = await opportunityService.submitPartnerOpportunityIntoDB(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Partner opportunity submitted successfully for admin review.",
        data: result,
    });
});

const getOpportunities = catchAsync(async (req: Request, res: Response) => {
    const result = await opportunityService.getAllOpportunitiesForAdmin(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Opportunities retrieved successfully",
        meta: result.meta, // Pass meta to response
        data: result.data,
    });
});

const getPublishedOpportunities = catchAsync(async (req: Request, res: Response) => {
    const result = await opportunityService.getPublishedOpportunities(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Published opportunities retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getMyPartnerOpportunities = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)?._id || (req.user as any)?.id;
    const result = await opportunityService.getMyPartnerOpportunities(userId, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Partner opportunities retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const reviewOpportunity = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!opportunityService.OPPORTUNITY_STATUSES.includes(status)) {
        throw new AppError(
            "Status must be pending, reviewed, or rejected",
            httpStatus.BAD_REQUEST,
        );
    }

    const result = await opportunityService.updateOpportunityStatus(id, status);

    if (!result) {
        throw new AppError("Opportunity not found", httpStatus.NOT_FOUND);
    }

    if (result.isPartnerOpportunity) {
        void opportunityService.triggerPartnerOpportunityReindex().catch((error) => {
            console.error("Chatbot reindex failed after partner opportunity status update:", error);
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Opportunity marked as ${status}`,
        data: result,
    });
});

export const opportunityController = {
    submitOpportunity,
    submitPartnerOpportunity,
    getOpportunities,
    getPublishedOpportunities,
    getMyPartnerOpportunities,
    reviewOpportunity,
};
