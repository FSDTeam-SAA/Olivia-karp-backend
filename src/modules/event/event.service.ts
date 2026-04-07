import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Event } from "./event.model";
import { IEvent } from "./event.interface";
import ogs from 'open-graph-scraper';

/**
 * Helper to fetch Luma metadata safely
 */
const fetchMetadata = async (lumaUrl: string) => {
    try {
        const { result } = await ogs({ url: lumaUrl });

        // Clean the title to remove " · Luma"
        const rawTitle = result.ogTitle || "New Event";
        const cleanTitle = rawTitle.split(' · ')[0];

        return {
            title: cleanTitle,
            thumbnail: result.ogImage?.[0]?.url || "",
            description: result.ogDescription || "",
        };
    } catch (error) {
        return { title: "New Luma Event", thumbnail: "", description: "" };
    }
};


/**
 * Creates a new Luma event entry in the database.
 * New entries are set to 'isPublished: false' by default for Admin review.
 */
const createEventIntoDB = async (payload: Partial<IEvent>) => {
    const { lumaUrl } = payload;

    if (!lumaUrl) {
        throw new AppError("Luma URL is required", StatusCodes.BAD_REQUEST);
    }

    // Prevent duplicate Luma links
    const isExistingEvent = await Event.findOne({ lumaUrl });
    if (isExistingEvent) {
        throw new AppError("This event link has already been added.", StatusCodes.CONFLICT);
    }

    const metadata = await fetchMetadata(lumaUrl as string);

    const result = await Event.create({
        lumaUrl,
        ...metadata,
        price: Number(payload.price) || 0,
        currency: payload.currency || "CAD",
        isPublished: false, // Land in dashboard for review
    });

    return result;
};

/**
 * Toggles the visibility of an event.
 * Used by the Admin to make an event live or hide it.
 */
const toggleEventPublishStatus = async (eventId: string, isPublished: boolean) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new AppError("Event not found", StatusCodes.NOT_FOUND);
    }

    const result = await Event.findByIdAndUpdate(
        eventId,
        { isPublished },
        { new: true, runValidators: true }
    );

    return result;
};

/**
 * Fetches all events for the Admin Dashboard overview.
 */
const getAllEventsFromDB = async (query: Record<string, unknown>) => {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await Event.find()
        .sort("-createdAt")
        .skip(skip)
        .limit(limit);

    const total = await Event.countDocuments();
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
 * Fetches only published events for the public website.
 */
const getPublishedEventsFromDB = async () => {
    const result = await Event.find({ isPublished: true }).sort("-createdAt");
    return result;
};

/**
 * Deletes an event link.
 */
const deleteEventFromDB = async (eventId: string) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new AppError("Event not found", StatusCodes.NOT_FOUND);
    }

    const result = await Event.findByIdAndDelete(eventId);
    return result;
};

export const EventService = {
    createEventIntoDB,
    toggleEventPublishStatus,
    getAllEventsFromDB,
    getPublishedEventsFromDB,
    deleteEventFromDB,
};