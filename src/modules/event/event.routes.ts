import express from "express";
import { EventController } from "./event.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Luma-synced offline and online event management.
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/event/published:
 *   get:
 *     summary: Retrieve only live/published events (Public)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Array of published events
 */
router.get(
    "/published",
    EventController.getPublishedEvents
);

/**
 * @swagger
 * /api/v1/event/get:
 *   get:
 *     summary: Fetch all events with pagination (Admin Dashboard)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of events
 */
router.get(
    "/get",
    auth(USER_ROLE.ADMIN),
    EventController.getAllEvents
);

/**
 * @swagger
 * /api/v1/event/create:
 *   post:
 *     summary: Register a new Luma event link (Admin Only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lumaUrl
 *               - price
 *             properties:
 *               lumaUrl:
 *                 type: string
 *                 example: "https://lu.ma/example-event"
 *               price:
 *                 type: number
 *                 example: 25.00
 *               currency:
 *                 type: string
 *                 default: "CAD"
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post(
    "/create",
    auth(USER_ROLE.ADMIN),
    EventController.createEvent
);


/**
 * @swagger
 * /api/v1/event/{eventId}/toggle-publish:
 *   patch:
 *     summary: Toggle visibility (isPublished) of an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublished
 *             properties:
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch(
    "/:eventId/toggle-publish",
    auth(USER_ROLE.ADMIN),
    EventController.togglePublishStatus
);


/**
 * @swagger
 * /api/v1/event/{eventId}:
 *   delete:
 *     summary: Delete an event link from the system
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete(
    "/:eventId",
    auth(USER_ROLE.ADMIN),
    EventController.deleteEvent
);

export const EventRoutes = router;