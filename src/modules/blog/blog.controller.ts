import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BlogService } from './blog.service';
import { uploadToCloudinary } from '../../utils/cloudinary';



const createBlog = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const payload = req.body;

    // 1. Handle Thumbnail Image (Match the Schema Object)
    if (files?.thumbnailImage?.[0]) {
        const uploadResult = await uploadToCloudinary(
            files.thumbnailImage[0].path,
            'blogs/thumbnails'
        );
        // Correcting this to match the IBlog interface and Schema
        payload.thumbnailImage = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        };
    }

    // 2. Handle Author Profile Image (Match the Schema Object)
    if (files?.profileImage?.[0]) {
        const uploadResult = await uploadToCloudinary(
            files.profileImage[0].path,
            'blogs/authors'
        );
        // Correcting this to match the IBlogAuthor interface
        payload.author.profileImage = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        };
    }

    const result = await BlogService.createBlogIntoDB(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Blog created successfully with Cloudinary assets',
        data: result,
    });
});



const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
    const result = await BlogService.getAllBlogsFromDB(req.query);

    // Corner Case: If no blogs match a specific category filter, 
    // we return an empty array with 200 OK, not a 404.
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blogs retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
    const { blogId } = req.params;
    const result = await BlogService.getSingleBlogFromDB(blogId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog post retrieved successfully',
        data: result,
    });
});


const updateBlog = catchAsync(async (req: Request, res: Response) => {
    const { blogId } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const payload = req.body;

    if (files?.thumbnailImage?.[0]) {
        const uploadResult = await uploadToCloudinary(
            files.thumbnailImage[0].path,
            'blogs/thumbnails'
        );
        payload.thumbnailImage = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        };
    }

    if (files?.profileImage?.[0]) {
        const uploadResult = await uploadToCloudinary(
            files.profileImage[0].path,
            'blogs/authors'
        );

        if (!payload.author) payload.author = {};
        payload.author.profileImage = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        };
    }

    const result = await BlogService.updateBlogInDB(blogId, payload);
    // ... response logic
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog post updated successfully',
        data: result,
    })
});



const deleteBlog = catchAsync(async (req: Request, res: Response) => {
    const { blogId } = req.params;
    const result = await BlogService.deleteBlogFromDB(blogId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Blog post deleted successfully',
        data: result,
    });
});

export const BlogControllers = {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog,
};