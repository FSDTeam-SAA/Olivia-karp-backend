import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { opportunityService } from "./opportunity.service";
import httpStatus from "http-status";

const submitOpportunity = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id; // From auth middleware
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

const reviewOpportunity = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await opportunityService.updateOpportunityStatus(id, status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Opportunity marked as ${status}`,
        data: result,
    });
});

export const opportunityController = {
    submitOpportunity,
    getOpportunities,
    reviewOpportunity,
};