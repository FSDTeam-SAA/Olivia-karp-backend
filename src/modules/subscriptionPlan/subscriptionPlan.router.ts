import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import subscriptionPlanController from "./subscriptionPlan.controller";

/**
 * @swagger
 * tags:
 *   name: Subscription Plans
 *   description: Manage Act On Pricing model configurations and user tier retrievals.
 */

const router = Router();

/**
 * @swagger
 * /api/v1/subscriptionPlan/create:
 *   post:
 *     summary: Create a newly structured Subscription Tier (Admin Only)
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - planTier
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               planTier:
 *                 type: string
 *                 enum: [beginner, monthly, yearly]
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               billingType:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               accessLevels:
 *                 type: object
 *                 properties:
 *                   blogAndPodcast: { type: string }
 *                   mightyNetworks: { type: string }
 *                   aiChatbot: { type: string }
 *                   events: { type: string }
 *                   courses: { type: string }
 *                   careerServices: { type: string }
 *                   mentorship: { type: string }
 *               discounts:
 *                 type: object
 *                 properties:
 *                   aiChatbot: { type: number }
 *                   events: { type: number }
 *                   courses: { type: number }
 *                   careerServices: { type: number }
 *     responses:
 *       201:
 *         description: Successfully created the tier
 */
router.post(
  "/create",
  auth(USER_ROLE.ADMIN),
  subscriptionPlanController.createNewSubscriptionPlan,
);

/**
 * @swagger
 * /api/v1/subscriptionPlan/all:
 *   get:
 *     summary: Retrieve all available subscription tiers
 *     tags: [Subscription Plans]
 *     responses:
 *       200:
 *         description: Array of available tiers listed on the frontend
 */
router.get("/all", subscriptionPlanController.getAllSubscriptionPlans);

/**
 * @swagger
 * /api/v1/subscriptionPlan/{subscriptionPlanId}:
 *   get:
 *     summary: Get details of a single subscription plan
 *     tags: [Subscription Plans]
 *     parameters:
 *       - in: path
 *         name: subscriptionPlanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription plan details retrieved
 */
router.get(
  "/:subscriptionPlanId",
  subscriptionPlanController.getSingleSubscriptionPlan,
);

/**
 * @swagger
 * /api/v1/subscriptionPlan/update/{subscriptionPlanId}:
 *   put:
 *     summary: Update an existing subscription plan (Admin Only)
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionPlanId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 */
router.put(
  "/update/:subscriptionPlanId",
  auth(USER_ROLE.ADMIN),
  subscriptionPlanController.updateSubscriptionPlan,
);

const subscriptionPlanRouter = router;
export default subscriptionPlanRouter;

