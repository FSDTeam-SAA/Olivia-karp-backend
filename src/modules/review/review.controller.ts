import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

/**
 * Create a new review
 * Note: We extract the user ID from the 'user' object attached by the auth middleware
 */
const createReview = catchAsync(async (req: Request, res: Response) => {
    // 1. Debugging check: if this is undefined, your auth middleware is broken
    if (!req.user) {
        throw new AppError('Authentication user data missing', httpStatus.UNAUTHORIZED);
    }

    // 2. Extract ID safely (handle both Mongoose _id and standard id)
    const userId = (req.user as any)._id || (req.user as any).id;

    // 3. Pass to service
    const result = await ReviewService.createReviewIntoDB(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Review submitted successfully!',
        data: result,
    });
});

/**
 * Get all approved reviews for the landing page
 */
const getApprovedReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getApprovedReviewsFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews fetched successfully.',
        data: result,
    });
});


const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReviewsFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All reviews fetched successfully.',
        meta: result.meta, // Pass meta here
        data: result.result, // Pass the array here
    });
});


/**
 * Admin: Update review status (Approve or Feature)
 */
const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const result = await ReviewService.updateReviewInDB(reviewId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review updated successfully.',
        data: result,
    });
});

/**
 * Admin: Delete a review
 */
const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    await ReviewService.deleteReviewFromDB(reviewId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review deleted successfully.',
        data: null,
    });
});



export const ReviewController = {
    createReview,
    getApprovedReviews,
    updateReviewStatus,
    deleteReview,
    getAllReviews
};