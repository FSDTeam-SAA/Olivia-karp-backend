import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { CourseIdeaServices } from './course.service';

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

export const CourseIdeaControllers = {
    submitIdea,
};