import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import surveyController from "./survey.controller";

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: Onboarding surveys and profile completion data for Act On Pricing personalization
 */

const router = Router();

/**
 * @swagger
 * /api/v1/survey/create:
 *   post:
 *     summary: Submit an onboarding survey
 *     tags: [Survey]
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
 *               - city
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               link:
 *                 type: string
 *               climateJourney:
 *                 type: string
 *               message:
 *                 type: string
 *               interest:
 *                 type: array
 *                 items: { type: string }
 *               goals:
 *                 type: array
 *                 items: { type: string }
 *               engagementPreference:
 *                 type: string
 *               region:
 *                 type: string
 *     responses:
 *       201:
 *         description: Survey submitted successfully
 */
router.post(
  "/create",
  auth(USER_ROLE.NON_MEMBER),
  surveyController.createNewSurvey,
);

/**
 * @swagger
 * /api/v1/survey:
 *   get:
 *     summary: Retrieve all survey responses (Admin Only)
 *     tags: [Survey]
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
 *         description: List of survey responses retrieved successfully
 */
router.get("/", auth(USER_ROLE.ADMIN), surveyController.getAllSurveys);

/**
 * @swagger
 * /api/v1/survey/{id}:
 *   get:
 *     summary: Get details of a single survey response
 *     tags: [Survey]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Survey details retrieved
 */
router.get("/:id", surveyController.getSingleSurvey);

const surveyRouter = router;
export default surveyRouter;

