import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import purchaseSubscriptionController from "./purchaseSubscription.controller";

/**
 * @swagger
 * tags:
 *   name: PurchaseSubscription
 *   description: API operations for PurchaseSubscription
 */


const router = Router();

// 🔹 Get current user's active benefits (access levels + discounts)

/**
 * @swagger
 * /api/v1/purchaseSubscription/my-benefits:
 *   get:
 *     summary: GET endpoint for purchaseSubscription
 *     tags: [PurchaseSubscription]
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
router.get(
  "/my-benefits",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.getUserBenefits,
);

// 🔹 Get current user's subscription history

/**
 * @swagger
 * /api/v1/purchaseSubscription/me:
 *   get:
 *     summary: GET endpoint for purchaseSubscription
 *     tags: [PurchaseSubscription]
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
router.get(
  "/me",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.getMySubscription,
);

// 🔹 Admin: Get all subscriptions (paginated)

/**
 * @swagger
 * /api/v1/purchaseSubscription/all:
 *   get:
 *     summary: GET endpoint for purchaseSubscription
 *     tags: [PurchaseSubscription]
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
router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  purchaseSubscriptionController.getAllSubscriptions,
);

const purchaseSubscriptionRouter = router;
export default purchaseSubscriptionRouter;
