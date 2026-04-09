import AppError from "../../errors/AppError";
import { deleteFromCloudinary } from "../../utils/cloudinary";
import { IBlog } from "./blog.interface";
import { Blog } from "./blog.model";
import httpStatus from 'http-status';



/**
 * Service: Create Blog
 * Logic: Persists rich text content and nested author data.
 */
const createBlogIntoDB = async (payload: IBlog): Promise<IBlog> => {
    // Only check for duplicates if title exists and isn't empty
    if (payload.title) {
        const isExist = await Blog.findOne({ title: payload.title });
        if (isExist) {
            throw new AppError(
                'A blog with this title already exists.',
                httpStatus.CONFLICT,
            );
        }
    }

    const result = await Blog.create(payload);
    return result;
};


/**
 * Service: Get All Blogs
 * Logic: Supports category filtering, search, and pagination.
 */
const getAllBlogsFromDB = async (query: Record<string, unknown>) => {
    const { searchTerm, category, isFeatured, isPublished, page = 1, limit = 10 } = query;

    const queryBuilder: any = {};

    // Logic 1: Search (Title and Content)
    if (searchTerm) {
        queryBuilder.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
        ];
    }

    // Logic 2: Figma Category Filtering
    if (category) {
        queryBuilder.category = category;
    }

    // Logic 3: Visibility and Featured Status
    if (isFeatured !== undefined) {
        queryBuilder.isFeatured = isFeatured === 'true';
    }

    if (isPublished !== undefined) {
        queryBuilder.isPublished = isPublished === 'true';
    }

    const currentPage = Math.abs(Number(page)) || 1;
    const currentLimit = Math.abs(Number(limit)) || 10;
    const skip = (currentPage - 1) * currentLimit;

    // Optimized Execution
    const result = await Blog.find(queryBuilder)
        .sort({ createdAt: -1 }) // Show latest blogs first
        .skip(skip)
        .limit(currentLimit)
        .lean();

    const total = await Blog.countDocuments(queryBuilder);
    const totalPage = Math.ceil(total / currentLimit);

    return {
        meta: {
            page: currentPage,
            limit: currentLimit,
            total,
            totalPage,
        },
        data: result,
    };
};


/**
 * Service: Update Blog
 * Logic: Handles partial updates for flat fields and nested author fields.
 */
// const updateBlogInDB = async (blogId: string, payload: Partial<IBlog>): Promise<IBlog | null> => {
//     const isExist = await Blog.findById(blogId);
//     if (!isExist) {
//         throw new AppError('Blog post not found', httpStatus.NOT_FOUND);
//     }

//     // 1. Storage Cleanup: Delete old thumbnail if a new one is being uploaded
//     if (payload.thumbnailImage?.public_id && isExist.thumbnailImage?.public_id) {
//         await deleteFromCloudinary(isExist.thumbnailImage.public_id);
//     }

//     // 2. Storage Cleanup: Delete old author profile if a new one is being uploaded
//     if (payload.author?.profileImage?.public_id && isExist.author?.profileImage?.public_id) {
//         await deleteFromCloudinary(isExist.author.profileImage.public_id);
//     }

//     const { author, ...remainingData } = payload;
//     const modifiedUpdatedData: Record<string, unknown> = { ...remainingData };

//     if (author && Object.keys(author).length > 0) {
//         for (const [key, value] of Object.entries(author)) {
//             modifiedUpdatedData[`author.${key}`] = value;
//         }
//     }

//     return await Blog.findByIdAndUpdate(
//         blogId,
//         modifiedUpdatedData,
//         { new: true, runValidators: true }
//     );
// };

const updateBlogInDB = async (blogId: string, payload: Partial<IBlog>): Promise<IBlog | null> => {
    const isExist = await Blog.findById(blogId);
    if (!isExist) {
        throw new AppError('Blog post not found', httpStatus.NOT_FOUND);
    }

    // 1. Cleanup old images from Cloudinary if new ones are provided
    if (payload.thumbnailImage?.public_id && isExist.thumbnailImage?.public_id) {
        await deleteFromCloudinary(isExist.thumbnailImage.public_id);
    }
    if (payload.author?.profileImage?.public_id && isExist.author?.profileImage?.public_id) {
        await deleteFromCloudinary(isExist.author.profileImage.public_id);
    }

    const { author, ...remainingData } = payload;
    const modifiedUpdatedData: Record<string, any> = { ...remainingData };

    // 2. Properly flatten nested author updates
    if (author && Object.keys(author).length > 0) {
        for (const [key, value] of Object.entries(author)) {
            // This handles name, description, AND the profileImage object
            modifiedUpdatedData[`author.${key}`] = value;
        }
    }

    const result = await Blog.findByIdAndUpdate(blogId, modifiedUpdatedData, {
        new: true,
        runValidators: true,
    });

    return result;
};



/**
 * Service: Get Single Blog
 */
const getSingleBlogFromDB = async (blogId: string): Promise<IBlog> => {
    const result = await Blog.findById(blogId).lean();
    if (!result) {
        throw new AppError('Blog post not found', httpStatus.NOT_FOUND);
    }
    return result;
};

/**
 * Service: Delete Blog
 * Logic: Cleans up Cloudinary assets before removing the DB record.
 */
const deleteBlogFromDB = async (blogId: string): Promise<IBlog | null> => {
    const isExist = await Blog.findById(blogId);
    if (!isExist) {
        throw new AppError('Blog post not found', httpStatus.NOT_FOUND);
    }

    // Clean up Thumbnail from Cloudinary
    if (isExist.thumbnailImage?.public_id) {
        await deleteFromCloudinary(isExist.thumbnailImage.public_id);
    }

    // Clean up Author Profile Image from Cloudinary
    if (isExist.author?.profileImage?.public_id) {
        await deleteFromCloudinary(isExist.author.profileImage.public_id);
    }

    return await Blog.findByIdAndDelete(blogId);
};


export const BlogService = {
    createBlogIntoDB,
    getAllBlogsFromDB,
    updateBlogInDB,
    getSingleBlogFromDB,
    deleteBlogFromDB
}