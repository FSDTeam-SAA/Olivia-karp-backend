import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { CourseIdeaServices } from './courseIdea.service';

const submitIdea = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    // DEBUG: Check the terminal to see if it shows 'id' or '_id'
    console.log("JWT USER DATA:", user);

    const result = await CourseIdeaServices.submitIdeaIntoDB({
        ...req.body,
        // This is the "Safe Guard": check both possible keys
        submittedBy: user!._id || (user as any).id,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Course idea submitted successfully!',
        data: result,
    });
});

const getAllIdeas = catchAsync(async (req: Request, res: Response) => {
    // Pass the query object (containing page/limit) to the service
    const { meta, result } = await CourseIdeaServices.getAllIdeasFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All course ideas retrieved successfully',
        meta, // { page: 1, limit: 10, total: 50, totalPage: 5 }
        data: result,
    });
});

const getSingleIdea = catchAsync(async (req: Request, res: Response) => {
    const { courseIdeaId } = req.params;

    const result = await CourseIdeaServices.getSingleIdeaFromDB(courseIdeaId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Course idea retrieved successfully',
        data: result,
    });
});

const deleteCourseIdea = catchAsync(async (req: Request, res: Response) => {
    const { courseIdeaId } = req.params;
    const result = await CourseIdeaServices.deleteCourseIdeaFromDB(courseIdeaId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Course idea deleted successfully',
        data: null,
    });
});


const updateIdeaStatus = catchAsync(async (req: Request, res: Response) => {
    const { courseIdeaId } = req.params;
    const { status } = req.body;

    const result = await CourseIdeaServices.updateStatusInDB(courseIdeaId, status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Course idea status updated to ${status} successfully`,
        data: result,
    });
});




export const CourseIdeaControllers = {
    submitIdea,
    getAllIdeas,
    getSingleIdea,
    deleteCourseIdea,
    updateIdeaStatus


};