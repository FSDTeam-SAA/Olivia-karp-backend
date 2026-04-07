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
 *     summary: Retrieve published events (Public)
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
 *     summary: Fetch all events for Admin Dashboard
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of events
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
 *     summary: Create an event entry using a Luma URL and base price
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lumaUrl:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Event created
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
 *     summary: PATCH endpoint for event
 *     tags: [Event]
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *     summary: DELETE endpoint for event
 *     tags: [Event]
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete(
    "/:eventId",
    auth(USER_ROLE.ADMIN),
    EventController.deleteEvent
);

export const EventRoutes = router;