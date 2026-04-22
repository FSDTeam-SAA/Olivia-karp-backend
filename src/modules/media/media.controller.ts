import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync'; // Assuming your standard utility
import sendResponse from '../../utils/sendResponse'; // Assuming your standard utility
import { MediaService } from './media.service';
import { uploadToCloudinary } from '../../utils/cloudinary';

const createMedia = catchAsync(async (req: Request, res: Response) => {
    const payload = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Parse booleans from multipart/form-data strings
    if (typeof payload.isPublished === 'string') {
        payload.isPublished = payload.isPublished === 'true';
    }
    if (typeof payload.isFeatured === 'string') {
        payload.isFeatured = payload.isFeatured === 'true';
    }

    // Handle file uploads
    if (files) {
        if (files.thumbnailImage && files.thumbnailImage[0]) {
            const cloudinaryResult = await uploadToCloudinary(
                files.thumbnailImage[0].path,
                'media-thumbnails'
            );
            payload.thumbnailImage = cloudinaryResult.secure_url;
        }

        if (files.mediaFile && files.mediaFile[0]) {
            // Upload audio or doc files to Cloudinary
            const cloudinaryResult = await uploadToCloudinary(
                files.mediaFile[0].path,
                'media-contents'
            );
            payload.contentUrl = cloudinaryResult.secure_url;
        }
    }

    const result = await MediaService.createMediaIntoDB(payload);

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
    const payload = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Parse booleans from multipart/form-data strings
    if (typeof payload.isPublished === 'string') {
        payload.isPublished = payload.isPublished === 'true';
    }
    if (typeof payload.isFeatured === 'string') {
        payload.isFeatured = payload.isFeatured === 'true';
    }

    // Handle file uploads for update
    if (files) {
        if (files.thumbnailImage && files.thumbnailImage[0]) {
            const cloudinaryResult = await uploadToCloudinary(
                files.thumbnailImage[0].path,
                'media-thumbnails'
            );
            payload.thumbnailImage = cloudinaryResult.secure_url;
        }

        if (files.mediaFile && files.mediaFile[0]) {
            const cloudinaryResult = await uploadToCloudinary(
                files.mediaFile[0].path,
                'media-contents'
            );
            payload.contentUrl = cloudinaryResult.secure_url;
        }
    }

    const result = await MediaService.updateMediaInDB(mediaId, payload);

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