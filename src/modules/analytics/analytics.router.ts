import { Router } from "express";
import analyticsController from "./analytics.controller";

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: System-wide analytics and performance tracking
 */

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/course:
 *   get:
 *     summary: Retrieve aggregate analytics for courses and enrollments
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Course analytics retrieved successfully
 */
router.get("/course", analyticsController.getCourserAnalytics);
router.get("/dashboard", analyticsController.dashboardAnalytics);
router.get("/chat", analyticsController.chatAnalytics);
router.get("/activity", analyticsController.recentActivity);

const analyticsRouter = router;
export default analyticsRouter;
