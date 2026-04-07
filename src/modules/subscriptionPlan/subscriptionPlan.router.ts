import { Router } from "express";

/**
 * @swagger
 * tags:
 *   name: Subscription Plans
 *   description: Manage the Act On Pricing model configurations and user tier retrievals.
 */
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import subscriptionPlanController from "./subscriptionPlan.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/subscription/create:
 *   post:
 *     summary: Create a newly structured Subscription Tier
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
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
 *               planTier:
 *                 type: string
 *                 enum: [beginner, monthly, yearly]
 *               accessLevels:
 *                 type: object
 *               discounts:
 *                 type: object
 *     responses:
 *       200:
 *         description: Successfully created the tier mapping
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/create",
  auth(USER_ROLE.ADMIN),
  // validateRequest(subscriptionPlanValidation.createPlanValidation),
  subscriptionPlanController.createNewSubscriptionPlan,
);

/**
 * @swagger
 * /api/v1/subscription/all:
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
 *     summary: GET endpoint for subscriptionPlan
 *     tags: [SubscriptionPlan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionPlanId
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
router.get(
  "/:subscriptionPlanId",
  subscriptionPlanController.getSingleSubscriptionPlan,
);


/**
 * @swagger
 * /api/v1/subscriptionPlan/update/{subscriptionPlanId}:
 *   put:
 *     summary: PUT endpoint for subscriptionPlan
 *     tags: [SubscriptionPlan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionPlanId
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
router.put(
  "/update/:subscriptionPlanId",
  subscriptionPlanController.updateSubscriptionPlan,
);

const subscriptionPlanRouter = router;
export default subscriptionPlanRouter;
