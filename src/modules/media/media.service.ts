import httpStatus from 'http-status';
import { IMedia } from './media.interface';
import { Media } from './media.model';
import AppError from '../../errors/AppError';

/**
 * Service: Create Media
 * Logic: Handles automatic thumbnailing for YouTube and source consistency.
 */
const createMediaIntoDB = async (payload: Partial<IMedia>) => {
    // 1. YouTube ID Extraction Logic (only if mediaType is 'url')
    if (payload.mediaType === 'url') {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\s]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/i;
        const match = payload.contentUrl?.match(youtubeRegex);
        const videoId = match ? match[1] : null;

        // 2. Thumbnail Hierarchy Logic
        if (!payload.thumbnailImage && videoId) {
            payload.thumbnailImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
    }

    // Priority 3: Final Fallback Placeholder
    if (!payload.thumbnailImage) {
        payload.thumbnailImage = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/defaults/placeholder.png';
    }

    // 3. Duplicate Check
    const isExist = await Media.findOne({ title: payload.title });
    if (isExist) {
        throw new AppError('A media post with this title already exists.', httpStatus.CONFLICT);
    }

    const result = await Media.create(payload);
    return result;
};

/**
 * Service: Get All Media
 * Logic: Implements precise pagination math, text search, and multi-field filtering.
 */
const getAllMediaFromDB = async (query: Record<string, unknown>) => {
    const { searchTerm, mediaType, category, isFeatured, isPublished, page = 1, limit = 10 } = query;
    const queryBuilder: any = {};

    // Logic 1: Enhanced Search (Now includes Category)
    if (searchTerm) {
        queryBuilder.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }, // Now searches category names too
        ];
    }

    // Logic 2: Filter Logic
    if (mediaType) {
        const mediaTypes = (mediaType as string).split(',').map(t => t.trim());
        queryBuilder.mediaType = { $in: mediaTypes };
    }

    if (category) {
        const categories = (category as string).split(',').map(c => c.trim());
        queryBuilder.category = { $in: categories };
    }

    // Logic 3: Status Filtering
    if (isFeatured !== undefined) {
        queryBuilder.isFeatured = isFeatured === 'true';
    }
    if (isPublished !== undefined) {
        queryBuilder.isPublished = isPublished === 'true';
    }

    // Logic 4: Pagination & Execution
    const currentPage = Math.abs(Number(page)) || 1;
    const currentLimit = Math.abs(Number(limit)) || 10;
    const skip = (currentPage - 1) * currentLimit;

    const result = await Media.find(queryBuilder)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit)
        .lean();

    const total = await Media.countDocuments(queryBuilder);
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
 * Service: Update Media
 */
const updateMediaInDB = async (id: string, payload: Partial<IMedia>): Promise<IMedia | null> => {
    const isExist = await Media.findById(id);
    if (!isExist) {
        throw new AppError('Media post not found', httpStatus.NOT_FOUND);
    }

    // Handle Title Duplicates
    if (payload.title && payload.title !== isExist.title) {
        const isTitleTaken = await Media.findOne({ title: payload.title });
        if (isTitleTaken) {
            throw new AppError('Another media post already has this title.', httpStatus.CONFLICT);
        }
    }

    const result = await Media.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

/**
 * Service: Get Single Media
 * Logic: Fetches a specific media post and handles the "Not Found" case.
 */
const getSingleMediaFromDB = async (mediaId: string): Promise<IMedia> => {
    const result = await Media.findById(mediaId).lean();

    if (!result) {
        throw new AppError('Media post not found', httpStatus.NOT_FOUND);
    }

    return result;
};

/**
 * Service: Delete Media
 * Logic: Ensures the item exists before deletion.
 */
const deleteMediaFromDB = async (mediaId: string): Promise<IMedia | null> => {
    const isExist = await Media.findById(mediaId);

    if (!isExist) {
        throw new AppError('Media post not found', httpStatus.NOT_FOUND);
    }

    const result = await Media.findByIdAndDelete(mediaId);
    return result;
};

export const MediaService = {
    createMediaIntoDB,
    getAllMediaFromDB,
    getSingleMediaFromDB,
    updateMediaInDB,
    deleteMediaFromDB,
};