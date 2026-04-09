import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import InterviewController from "./Interview.controller";

/**
 * @swagger
 * tags:
 *   name: Interview
 *   description: Mock interview sessions and professional coaching bookings
 */

const router = Router();

/**
 * @swagger
 * /api/v1/Interview/create:
 *   post:
 *     summary: Book a new mock interview session
 *     tags: [Interview]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - topic
 *               - industry
 *               - date
 *               - time
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               topic:
 *                 type: string
 *               industry:
 *                 type: string
 *               professionalBackground:
 *                 type: string
 *               focus:
 *                 type: string
 *               preferredQuestions:
 *                 type: array
 *                 items:
 *                   type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interview booked successfully
 */
router.post(
  "/create",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  InterviewController.createInterview,
);

/**
 * @swagger
 * /api/v1/Interview:
 *   get:
 *     summary: Retrieve all interview bookings (Admin Only)
 *     tags: [Interview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'approved', 'rejected']
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
 *         description: List of interviews retrieved
 */
router.get("/", auth(USER_ROLE.ADMIN), InterviewController.getAllInterviews);

/**
 * @swagger
 * /api/v1/Interview/{id}:
 *   get:
 *     summary: Get details of a single interview booking (Admin Only)
 *     tags: [Interview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview details retrieved
 */
router.get(
  "/:id",
  auth(USER_ROLE.ADMIN),
  InterviewController.getSingleInterview,
);

/**
 * @swagger
 * /api/v1/Interview/update/{id}:
 *   put:
 *     summary: Update interview booking status (Admin Only)
 *     tags: [Interview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['pending', 'approved', 'rejected']
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put(
  "/update/:id",
  auth(USER_ROLE.ADMIN),
  InterviewController.updateStatus,
);

const InterviewRouter = router;
export default InterviewRouter;

