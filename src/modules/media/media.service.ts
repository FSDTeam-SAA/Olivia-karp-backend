import httpStatus from 'http-status';
import { IMedia } from './media.interface';
import { Media } from './media.model';
import AppError from '../../errors/AppError';

/**
 * Service: Create Media
 * Logic: Handles automatic thumbnailing for YouTube and source consistency.
 */
const createMediaIntoDB = async (payload: IMedia): Promise<IMedia> => {
    // Logic 1: YouTube Extraction
    const youtubeRegex = /(?:youtube\.com\/(?:[^\s]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/i;

    // We only have 'URL' now, so we check contentUrl directly
    const match = payload.contentUrl.match(youtubeRegex);
    const videoId = match ? match[1] : null;

    if (videoId && !payload.thumbnailImage) {
        payload.thumbnailImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Logic 2: Mandatory Fallback 
    // If it's not YouTube and no thumbnail provided, we need a default to prevent frontend breakage
    if (!payload.thumbnailImage) {
        payload.thumbnailImage = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/defaults/placeholder.png';
    }

    // Logic 3: Duplicate Check
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
    const { searchTerm, mediaType, isFeatured, isPublished, page = 1, limit = 10 } = query;

    const queryBuilder: any = {};

    // Logic 1: Search Logic (Partial match on title or description)
    if (searchTerm) {
        queryBuilder.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
        ];
    }

    // Logic 2: Filter Logic
    // Matches the exact enum types: 'video' | 'podcast' | 'event-recording' etc.
    if (mediaType) {
        queryBuilder.mediaType = mediaType;
    }

    // Handle boolean strings from URL query params safely
    if (isFeatured !== undefined) {
        queryBuilder.isFeatured = isFeatured === 'true';
    }

    if (isPublished !== undefined) {
        queryBuilder.isPublished = isPublished === 'true';
    }

    // Logic 3: Elite Pagination Math
    // Use Math.abs to ensure numbers are positive; fallback to defaults if NaN
    const currentPage = Math.abs(Number(page)) || 1;
    const currentLimit = Math.abs(Number(limit)) || 10;
    const skip = (currentPage - 1) * currentLimit;

    // Optimized execution: lean() removes Mongoose overhead for read-only ops
    const result = await Media.find(queryBuilder)
        .sort({ createdAt: -1 }) // Newest content first
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
 * Logic: Re-calculates thumbnails if URL changes and ensures data consistency.
 */
const updateMediaInDB = async (id: string, payload: Partial<IMedia>): Promise<IMedia | null> => {
    // Logic 1: Check if the media exists first
    const isExist = await Media.findById(id);
    if (!isExist) {
        throw new AppError('Media post not found', httpStatus.NOT_FOUND);
    }

    // Logic 2: Re-run YouTube Thumbnail Logic if contentUrl is updated
    if (payload.contentUrl || payload.sourceType) {
        const finalUrl = payload.contentUrl || isExist.contentUrl;
        const finalSourceType = payload.sourceType || isExist.sourceType;

        const youtubeRegex = /(?:youtube\.com\/(?:[^]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/i;

        if (finalSourceType === 'URL') {
            const match = finalUrl.match(youtubeRegex);
            const videoId = match ? match[1] : null;

            // Only auto-update thumbnail if the URL changed and no new thumbnail was provided
            if (videoId && !payload.thumbnailImage) {
                payload.thumbnailImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        }

        // Logic 3: Consistency Check for File updates
        // if (finalSourceType === 'FILE' && !finalUrl.startsWith('http')) {
        //     throw new AppError(
        //         'A valid cloud storage URL is required for FILE source types.',
        //         httpStatus.BAD_REQUEST,
        //     );
        // }
    }

    // Logic 4: Handle Title Duplicates (if title is being changed)
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