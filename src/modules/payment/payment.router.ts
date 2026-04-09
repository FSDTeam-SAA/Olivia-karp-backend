import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import paymentController from "./payment.controller";

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Stripe payment processing for subscriptions and standalone modules (Courses, Events, Career Services)
 */

const router = Router();

/**
 * @swagger
 * /api/v1/payment/purchase:
 *   post:
 *     summary: Purchase a Subscription Plan (Stripe)
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
 *               - subscriptionPlanId
 *             properties:
 *               subscriptionPlanId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a Stripe checkout URL
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
 *     summary: Unified Checkout for Standalone Modules (Course, Event, Career Service)
 *     description: Calculates Act On Pricing discounts natively and creates a Stripe checkout session.
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
 *         description: Either grants access instantly (if free/included) or returns a Stripe Checkout URL.
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
 *     summary: Stripe Webhook Endpoint
 *     description: Handles checkout.session.completed events to fulfill purchases.
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post("/webhook", paymentController.stripeWebhookHandler);

/**
 * @swagger
 * /api/v1/payment/all:
 *   get:
 *     summary: Retrieve all payment transactions (Admin Only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, unpaid]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by transactionId
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
 *         description: List of payments retrieved
 */
router.get("/all", auth(USER_ROLE.ADMIN), paymentController.getAllPayment);

/**
 * @swagger
 * /api/v1/payment/me:
 *   get:
 *     summary: Retrieve my payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal payment history retrieved
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
 *     summary: Get details of a single payment transaction
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
 *         description: Payment details retrieved
 */
router.get(
  "/:paymentId",
  auth(USER_ROLE.ADMIN),
  paymentController.getSinglePayment,
);

const paymentRouter = router;
export default paymentRouter;

