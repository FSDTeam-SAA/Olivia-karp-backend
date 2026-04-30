import httpStatus from 'http-status';
import AppError from '../../errors/AppError'; // Assuming you have a custom error handler
import { IReview } from './review.interface';
import { Review } from './review.model';
import { Types } from 'mongoose';


/**
 * Create a Review
 * */
const createReviewIntoDB = async (userId: string, payload: IReview) => {
    // 1. Double check the userId exists
    if (!userId) {
        throw new AppError('User authentication failed!', httpStatus.UNAUTHORIZED);
    }

    // 2. Prevent duplicate reviews
    const alreadyReviewed = await Review.findOne({ user: userId });
    if (alreadyReviewed) {
        throw new AppError('You have already submitted a review.', httpStatus.BAD_REQUEST);
    }

    // 3. Create the review
    const result = await Review.create({
        ...payload,
        user: userId, // Mongoose handles the string to ObjectId conversion here
    });

    // 4. POPULATE FIX:
    // We must execute the population on the created document
    const populatedResult = await Review.findById(result._id).populate({
        path: 'user',
        select: 'firstName lastName image role email', // Added email for Admin clarity
    });

    return populatedResult;
};

/**
 * Get all approved reviews for the Website
 * Corner Case: What if the linked User was deleted? 
 * Logic: We filter out reviews where the 'user' field comes back null after population.
 */
const getApprovedReviewsFromDB = async () => {
    const result = await Review.find({ isApproved: true })
        .populate({
            path: 'user',
            select: 'firstName lastName image role',
        })
        .sort({ isFeatured: -1, createdAt: -1 }) // Featured first, then newest
        .lean();

    // Corner Case: Filter out reviews where the user account no longer exists
    return result.filter((review) => review.user !== null);
};

/**
 * Admin: Get all reviews (including unapproved)
 */
const getAllReviewsFromDB = async (query: Record<string, unknown>) => {
    // 1. Pagination Logic
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Filtering Logic (e.g., filter by isApproved or isFeatured if provided)
    const filterQuery = { ...query };
    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((el) => delete filterQuery[el]);

    // 3. Execution
    const result = await Review.find(filterQuery)
        .populate('user', 'firstName lastName email image role')
        .sort({ createdAt: -1 }) // Default: Newest first
        .skip(skip)
        .limit(limit);

    // 4. Meta Information (Essential for Frontend Pagination)
    const total = await Review.countDocuments(filterQuery);
    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        result,
    };
};

/**
 * Update Review (Approval/Featured status)
 */
const updateReviewInDB = async (reviewId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError("Review not found", httpStatus.NOT_FOUND);
  }

  const result = await Review.findByIdAndUpdate(
    reviewId,
    {
      isApproved: !review.isApproved,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

/**
 * Delete Review
 */
const deleteReviewFromDB = async (reviewId: string) => {
    const result = await Review.findByIdAndDelete(reviewId);
    if (!result) {
        throw new AppError('Review not found', httpStatus.NOT_FOUND);
    }
    return result;
};

export const ReviewService = {
    createReviewIntoDB,
    getApprovedReviewsFromDB,
    getAllReviewsFromDB,
    updateReviewInDB,
    deleteReviewFromDB,
};