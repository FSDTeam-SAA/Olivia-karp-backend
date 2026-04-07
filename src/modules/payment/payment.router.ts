import { Router } from "express";

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Stripe payment processing for Act On Pricing constraints, subscriptions, and standalone modules.
 */
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import paymentController from "./payment.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/payment/purchase:
 *   post:
 *     summary: Purchase a Subscription Plan
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionPlanId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a Stripe checkout URL
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/purchase",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  paymentController.createPaymentForSubscription,
);

/**
 * @swagger
 * /api/v1/payment/checkout-general:
 *   post:
 *     summary: Unified Checkout for Standalone Modules
 *     description: Creates a Stripe checkout session calculating Act On Pricing discounts for Course, Event, and Career Services natively.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemType
 *               - itemId
 *             properties:
 *               itemType:
 *                 type: string
 *                 enum: [course, event, careerService]
 *               itemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Either grants access instantly (if free_access) or returns a Stripe Checkout URL with the respective discount applied.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/checkout-general",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  paymentController.createGeneralCheckoutForEntity,
);


/**
 * @swagger
 * /api/v1/payment/webhook:
 *   post:
 *     summary: POST endpoint for payment
 *     tags: [Payment]
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
router.post("/webhook", paymentController.stripeWebhookHandler);

/**
 * @swagger
 * /api/v1/payment/all:
 *   get:
 *     summary: GET endpoint for payment
 *     tags: [Payment]
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
router.get("/all", auth(USER_ROLE.ADMIN), paymentController.getAllPayment);


/**
 * @swagger
 * /api/v1/payment/me:
 *   get:
 *     summary: GET endpoint for payment
 *     tags: [Payment]
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
  paymentController.getMyPayment,
);


/**
 * @swagger
 * /api/v1/payment/{paymentId}:
 *   get:
 *     summary: GET endpoint for payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
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
  "/:paymentId",
  //   auth(USER_ROLE.ADMIN),
  paymentController.getSinglePayment,
);

const paymentRouter = router;
export default paymentRouter;
