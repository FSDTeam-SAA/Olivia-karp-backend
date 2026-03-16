import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ApplyBlogService } from './applyBlog.service';
import AppError from '../../errors/AppError';


/**
 * User submits a blog idea
 */
const submitBlogIdea = catchAsync(async (req: Request, res: Response) => {
    // Check if the property is 'id' or '_id'
    const userId = (req.user as any)?._id || (req.user as any)?.id;

    if (!userId) {
        throw new AppError(
            "User identification failed. Please login again.",
            httpStatus.UNAUTHORIZED
        );
    }

    const result = await ApplyBlogService.submitBlogIdeaIntoDB(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Blog idea submitted successfully! It is now pending review.',
        data: result,
    });
});

/**
 * Admin updates blog (Content, Status, or Metadata)
 */
const updateBlog = catchAsync(async (req: Request, res: Response) => {
    const { applyBlogId } = req.params;
    const result = await ApplyBlogService.updateBlogInDB(applyBlogId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog Idea record updated successfully.',
        data: result,
    });
});

/**
 * Get all blogs (Handles public feed or admin list based on query)
 */
const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
    const result = await ApplyBlogService.getAllBlogsFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog Ideas fetched successfully.',
        data: result,
    });
});

/**
 * Get single blog by ID
 */
const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
    const { applyBlogId } = req.params;
    const result = await ApplyBlogService.getSingleBlogFromDB(applyBlogId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog details retrieved successfully.',
        data: result,
    });
});

/**
 * Admin deletes a blog/idea
 */
const deleteBlog = catchAsync(async (req: Request, res: Response) => {
    const { applyBlogId } = req.params;
    await ApplyBlogService.deleteBlogFromDB(applyBlogId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog record deleted successfully.',
        data: null,
    });
});

export const ApplyBlogController = {
    submitBlogIdea,
    updateBlog,
    getAllBlogs,
    getSingleBlog,
    deleteBlog,
};