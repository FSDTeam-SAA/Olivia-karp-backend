import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { getAllNotifications, markAllAsRead } from "./notification.controller";

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: System-wide admin notifications for user actions and enrollments
 */

const router = Router();

/**
 * @swagger
 * /api/v1/notification:
 *   get:
 *     summary: Retrieve all notifications (Admin Only)
 *     tags: [Notification]
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
 *         description: List of notifications retrieved successfully
 */
router.get("/", auth(USER_ROLE.ADMIN), getAllNotifications);

/**
 * @swagger
 * /api/v1/notification/read/all:
 *   patch:
 *     summary: Mark all unread notifications as viewed
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.patch("/read/all", markAllAsRead);

const notificationRouter = router;
export default notificationRouter;

