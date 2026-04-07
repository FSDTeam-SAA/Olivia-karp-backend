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
 *   description: API operations for Newsletter
 */



const router = express.Router();

// Public: Anyone can join

/**
 * @swagger
 * /api/v1/newsletter/subscribe:
 *   post:
 *     summary: POST endpoint for newsletter
 *     tags: [Newsletter]
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
router.post(
    '/subscribe',
    validateRequest(NewsletterValidation.createSubscriptionZodSchema),
    NewsletterController.subscribe);

// Private: Only the Admin can see the list in the dashboard

/**
 * @swagger
 * /api/v1/newsletter/all-subscribers:
 *   get:
 *     summary: GET endpoint for newsletter
 *     tags: [Newsletter]
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
router.get('/all-subscribers', auth(USER_ROLE.ADMIN), NewsletterController.getSubscribers);

// 2. Admin Routes (For Your Dashboard)

/**
 * @swagger
 * /api/v1/newsletter/stats:
 *   get:
 *     summary: GET endpoint for newsletter
 *     tags: [Newsletter]
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
    '/stats',
    auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN),
    NewsletterController.getSubscriberStats
);


/**
 * @swagger
 * /api/v1/newsletter/sync-retry:
 *   post:
 *     summary: POST endpoint for newsletter
 *     tags: [Newsletter]
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
router.post(
    '/sync-retry',
    auth(USER_ROLE.ADMIN),
    NewsletterController.syncUnsyncedSubscribers
);

export const NewsletterRoutes = router;