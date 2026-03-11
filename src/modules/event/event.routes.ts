import express from "express";
import { EventController } from "./event.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
// import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

/**
 * Public Routes
 * These can be accessed by anyone visiting actonclimate.ca
 */
router.get(
    "/published",
    EventController.getPublishedEvents
);

/**
 * Admin/Owner Routes
 * Only Olivia (Owner/Admin) can manage these links
 */

// 1. Fetch all links (including unpublished) for the Dashboard overview
router.get(
    "/get",
    auth(USER_ROLE.ADMIN),
    EventController.getAllEvents
);

// 2. Create a new event entry by pasting a Luma URL
router.post(
    "/create",
    auth(USER_ROLE.ADMIN),
    // validateRequest(EventValidation.createEventZodSchema),
    EventController.createEvent
);

// 3. Toggle visibility (Publish/Unpublish)
router.patch(
    "/:eventId/toggle-publish",
    auth(USER_ROLE.ADMIN),
    // validateRequest(EventValidation.togglePublishZodSchema),
    EventController.togglePublishStatus
);

// 4. Delete an event
router.delete(
    "/:eventId",
    auth(USER_ROLE.ADMIN),
    EventController.deleteEvent
);

export const EventRoutes = router;