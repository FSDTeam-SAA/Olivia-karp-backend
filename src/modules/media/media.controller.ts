import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync'; // Assuming your standard utility
import sendResponse from '../../utils/sendResponse'; // Assuming your standard utility
import { MediaService } from './media.service';


const createMedia = catchAsync(async (req: Request, res: Response) => {
    const result = await MediaService.createMediaIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Media post created successfully',
        data: result,
    });
});

const getAllMedia = catchAsync(async (req: Request, res: Response) => {
    const result = await MediaService.getAllMediaFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Media posts retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleMedia = catchAsync(async (req: Request, res: Response) => {
    const { mediaId } = req.params;
    const result = await MediaService.getSingleMediaFromDB(mediaId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Media post retrieved successfully',
        data: result,
    });
});

const updateMedia = catchAsync(async (req: Request, res: Response) => {
    const { mediaId } = req.params;
    const result = await MediaService.updateMediaInDB(mediaId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Media post updated successfully',
        data: result,
    });
});

const deleteMedia = catchAsync(async (req: Request, res: Response) => {
    const { mediaId } = req.params;
    const result = await MediaService.deleteMediaFromDB(mediaId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Media post deleted successfully',
        data: result,
    });
});

export const MediaController = {
    createMedia,
    getAllMedia,
    getSingleMedia,
    updateMedia,
    deleteMedia,
};