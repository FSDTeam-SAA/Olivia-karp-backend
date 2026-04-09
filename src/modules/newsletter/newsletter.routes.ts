import express from 'express';
import { NewsletterController } from './newsletter.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middleware/validateRequest';
import { NewsletterValidation } from './newsletter.validation';

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: Managing email subscriptions and subscriber synchronization for Act On Pricing outreach
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/newsletter/subscribe:
 *   post:
 *     summary: Subscribe a new email to the newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Successfully subscribed
 */
router.post(
    '/subscribe',
    validateRequest(NewsletterValidation.createSubscriptionZodSchema),
    NewsletterController.subscribe
);

/**
 * @swagger
 * /api/v1/newsletter/all-subscribers:
 *   get:
 *     summary: Retrieve all newsletter subscribers (Admin Only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscribers retrieved successfully
 */
router.get(
    '/all-subscribers',
    auth(USER_ROLE.ADMIN),
    NewsletterController.getSubscribers
);

/**
 * @swagger
 * /api/v1/newsletter/stats:
 *   get:
 *     summary: Get newsletter subscriber growth statistics (Admin Only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Newsletter stats retrieved successfully
 */
router.get(
    '/stats',
    auth(USER_ROLE.ADMIN),
    NewsletterController.getSubscriberStats
);

/**
 * @swagger
 * /api/v1/newsletter/sync-retry:
 *   post:
 *     summary: Manually retry synchronizing unsynced subscribers (Admin Only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync process triggered
 */
router.post(
    '/sync-retry',
    auth(USER_ROLE.ADMIN),
    NewsletterController.syncUnsyncedSubscribers
);

export const NewsletterRoutes = router;