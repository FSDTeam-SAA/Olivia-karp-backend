import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import speakerController from "./speaker.controller";

/**
 * @swagger
 * tags:
 *   name: Speaker
 *   description: Managing applications from industry experts to speak at Act On Pricing events
 */

const router = Router();

/**
 * @swagger
 * /api/v1/speaker/apply:
 *   post:
 *     summary: Apply to become a speaker at an event
 *     tags: [Speaker]
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
 *               - specialization
 *               - industry
 *               - professionalBackground
 *               - eventId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               specialization:
 *                 type: string
 *               industry:
 *                 type: string
 *               professionalBackground:
 *                 type: string
 *               eventId:
 *                 type: string
 *               climateMatters:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 */
router.post(
  "/apply",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  speakerController.applyForSpeaker,
);

/**
 * @swagger
 * /api/v1/speaker/all:
 *   get:
 *     summary: Retrieve all speaker applications (Admin Only)
 *     tags: [Speaker]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
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
 *         description: List of speaker applications retrieved successfully
 */
router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  speakerController.getAllAppliedSpeakers,
);

/**
 * @swagger
 * /api/v1/speaker/{id}:
 *   get:
 *     summary: Get details of a single speaker application
 *     tags: [Speaker]
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
 *         description: Speaker application details retrieved
 */
router.get(
  "/:id",
  auth(USER_ROLE.ADMIN),
  speakerController.getSingleDetailsForSpeaker,
);

/**
 * @swagger
 * /api/v1/speaker/update/{id}:
 *   put:
 *     summary: Moderate a speaker application (Admin Only)
 *     tags: [Speaker]
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
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Speaker status updated
 */
router.put(
  "/update/:id",
  auth(USER_ROLE.ADMIN),
  speakerController.updateStatus,
);

const speakerRouter = router;
export default speakerRouter;

