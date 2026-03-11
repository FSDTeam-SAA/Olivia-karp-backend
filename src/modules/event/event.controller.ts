import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EventService } from "./event.service";

/**
 * Creates a new event record.
 * This handles the "Submit" action from the Admin Dashboard.
 */
const createEvent = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.createEventIntoDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Event link added to dashboard successfully. Awaiting review.",
        data: result,
    });
});

/**
 * Toggles the 'isPublished' status of an event.
 * Triggered when Olivia clicks the toggle in the dashboard.
 */
const togglePublishStatus = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { isPublished } = req.body;

    const result = await EventService.toggleEventPublishStatus(eventId, isPublished);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: `Event ${isPublished ? "published live" : "hidden"} successfully.`,
        data: result,
    });
});

/**
 * Fetches all events for the Admin Dashboard.
 * Includes both published and unpublished links.
 */
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.getAllEventsFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All events retrieved for dashboard.",
        meta: result.meta, // Added meta here
        data: result.result,
    });
});


/**
 * Fetches only live events for the public website gallery.
 */
const getPublishedEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.getPublishedEventsFromDB();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Published events retrieved successfully.",
        data: result,
    });
});

/**
 * Deletes an event entry from the database.
 */
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    await EventService.deleteEventFromDB(eventId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Event deleted successfully.",
        data: null,
    });
});

export const EventController = {
    createEvent,
    togglePublishStatus,
    getAllEvents,
    getPublishedEvents,
    deleteEvent,
};