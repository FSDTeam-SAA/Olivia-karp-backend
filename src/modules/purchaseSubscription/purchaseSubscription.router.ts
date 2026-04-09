import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import purchaseSubscriptionController from "./purchaseSubscription.controller";

/**
 * @swagger
 * tags:
 *   name: PurchaseSubscription
 *   description: Managing user subscription status and calculating active benefits (Access Levels / Discounts)
 */

const router = Router();

/**
 * @swagger
 * /api/v1/purchaseSubscription/my-benefits:
 *   get:
 *     summary: Retrieve current user's active benefits (Access Levels + Discounts)
 *     description: Returns the calculated Act On Pricing benefits based on the user's active subscription tier.
 *     tags: [PurchaseSubscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active benefits retrieved successfully
 */
router.get(
  "/my-benefits",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.getUserBenefits,
);

/**
 * @swagger
 * /api/v1/purchaseSubscription/me:
 *   get:
 *     summary: Retrieve current user's subscription history
 *     tags: [PurchaseSubscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal subscription history retrieved
 */
router.get(
  "/me",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.getMySubscription,
);

/**
 * @swagger
 * /api/v1/purchaseSubscription/all:
 *   get:
 *     summary: Retrieve all user subscriptions (Admin Only)
 *     tags: [PurchaseSubscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
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
 *         description: Paginated list of all subscriptions
 */
router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  purchaseSubscriptionController.getAllSubscriptions,
);

const purchaseSubscriptionRouter = router;
export default purchaseSubscriptionRouter;

