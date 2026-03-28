import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NewsletterService } from './newsletter.service';

const subscribe = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await NewsletterService.subscribeUser(email);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Welcome to the newsletter!',
        data: result,
    });
});

const getSubscribers = catchAsync(async (req: Request, res: Response) => {
    const result = await NewsletterService.getAllSubscribers();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subscribers fetched successfully',
        data: result,
    });
});

const getSubscriberStats = catchAsync(async (req: Request, res: Response) => {
    const result = await NewsletterService.getSubscriberStats();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Newsletter stats retrieved successfully',
        data: result,
    });
});

const syncUnsyncedSubscribers = catchAsync(async (req: Request, res: Response) => {
    const result = await NewsletterService.syncUnsyncedSubscribers();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sync process completed',
        data: result,
    });
});

export const NewsletterController = { subscribe, getSubscribers, getSubscriberStats, syncUnsyncedSubscribers};