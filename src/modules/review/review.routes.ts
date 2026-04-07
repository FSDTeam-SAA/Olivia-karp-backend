import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import { ReviewController } from './review.controller';
import auth from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: API operations for Review
 */



const router = express.Router();

// Public: Landing page needs these

/**
 * @swagger
 * /api/v1/review/all:
 *   get:
 *     summary: GET endpoint for review
 *     tags: [Review]
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
router.get('/all', ReviewController.getAllReviews);

/**
 * @swagger
 * /api/v1/review/approved:
 *   get:
 *     summary: GET endpoint for review
 *     tags: [Review]
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
router.get('/approved', ReviewController.getApprovedReviews);

// User: Only logged-in users can post

/**
 * @swagger
 * /api/v1/review/submit-review:
 *   post:
 *     summary: POST endpoint for review
 *     tags: [Review]
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
    '/submit-review',
    auth(USER_ROLE.NON_MEMBER), // Replace with your TUserRole logic
    ReviewController.createReview
);

// Admin: Only owners can manage

/**
 * @swagger
 * /api/v1/review/{reviewId}:
 *   patch:
 *     summary: PATCH endpoint for review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
router.patch(
    '/:reviewId',
    auth(USER_ROLE.ADMIN), // Using your updated 'owner' naming convention
    ReviewController.updateReviewStatus
);


/**
 * @swagger
 * /api/v1/review/{reviewId}:
 *   delete:
 *     summary: DELETE endpoint for review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
router.delete(
    '/:reviewId',
    auth(USER_ROLE.ADMIN),
    ReviewController.deleteReview
);

export const ReviewRoutes = router;