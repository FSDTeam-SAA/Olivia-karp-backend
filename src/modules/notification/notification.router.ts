import { Router } from "express";
import { getAllNotifications, markAllAsRead } from "./notification.controller";
import auth from "../../middleware/auth";

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API operations for Notification
 */


const router = Router();


/**
 * @swagger
 * /api/v1/notification:
 *   get:
 *     summary: GET endpoint for notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", auth("admin"), getAllNotifications);

/**
 * @swagger
 * /api/v1/notification/read/all:
 *   patch:
 *     summary: PATCH endpoint for notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch("/read/all", markAllAsRead);

const notificationRouter = router;
export default notificationRouter;
