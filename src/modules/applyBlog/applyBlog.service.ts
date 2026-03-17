import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IApplyBlog } from './applyBlog.interface';
import { ApplyBlog } from './applyBlog.model';

/**
 * Submit a new blog idea (User logic)
 */
const submitBlogIdeaIntoDB = async (userId: string, payload: Partial<IApplyBlog>) => {
    // Ensure status is always pending on initial submission
    const result = await ApplyBlog.create({
        ...payload,
        user: userId,
        status: 'pending',
    });
    return result;
};

/**
 * Update blog status or content (Admin/Owner logic)
 */
const updateBlogInDB = async (applyBlogId: string, payload: Partial<IApplyBlog>) => {
    const isExist = await ApplyBlog.findById(applyBlogId);

    if (!isExist) {
        throw new AppError( 'Blog record not found!', httpStatus.NOT_FOUND);
    }

    // Logic Check: If publishing, ensure core content exists
    if (payload.status === 'published' && (!isExist.content && !payload.content)) {
        throw new AppError(
            'Cannot publish a blog without content!',
            httpStatus.BAD_REQUEST
        );
    }

    const result = await ApplyBlog.findByIdAndUpdate(applyBlogId, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

/**
 * Get all blogs with filtering (Admin Dashboard & Public Feed)
 */
/**
 * Get all blogs with pagination and filtering
 */
const getAllBlogsFromDB = async (query: Record<string, unknown>) => {
  // 1. Extract pagination fields from query and set defaults
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  // 2. Clone the query to remove pagination fields from the Mongoose filter
  const queryObj = { ...query };
  const excludeFields = ['page', 'limit', 'sort', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);

  // 3. Execute query with skip and limit
  const result = await ApplyBlog.find(queryObj)
    .populate('user', 'firstName lastName email image')
    .sort({ createdAt: -1 }) // Default sort by newest
    .skip(skip)
    .limit(limit);

  // 4. Get total count for frontend pagination metadata
  const total = await ApplyBlog.countDocuments(queryObj);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

/**
 * Get single blog details
 */
const getSingleBlogFromDB = async (applyBlogId: string) => {
    const result = await ApplyBlog.findById(applyBlogId).populate('user');
    if (!result) {
        throw new AppError(
            'Blog not found!',
            httpStatus.NOT_FOUND
        );
    }
    return result;
};

/**
 * Delete a blog/idea
 */
const deleteBlogFromDB = async (applyBlogId: string) => {
    const result = await ApplyBlog.findByIdAndDelete(applyBlogId);
    if (!result) {
        throw new AppError(
            'Blog not found!',
            httpStatus.NOT_FOUND
        );
    }
    return result;
};

export const ApplyBlogService = {
    submitBlogIdeaIntoDB,
    updateBlogInDB,
    getAllBlogsFromDB,
    getSingleBlogFromDB,
    deleteBlogFromDB,
};