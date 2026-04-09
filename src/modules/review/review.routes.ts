import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import { ReviewController } from './review.controller';
import auth from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Managing platform testimonials, student reviews, and featured feedback
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/review/all:
 *   get:
 *     summary: Retrieve all reviews with filtering (Admin Only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
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
 *         description: List of all reviews retrieved
 */
router.get('/all', auth(USER_ROLE.ADMIN), ReviewController.getAllReviews);

/**
 * @swagger
 * /api/v1/review/approved:
 *   get:
 *     summary: Retrieve approved reviews for public display
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: List of approved reviews
 */
router.get('/approved', ReviewController.getApprovedReviews);

/**
 * @swagger
 * /api/v1/review/submit-review:
 *   post:
 *     summary: Submit a new review or testimonial
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - rating
 *             properties:
 *               comment:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *     responses:
 *       201:
 *         description: Review submitted successfully
 */
router.post(
    '/submit-review',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
    ReviewController.createReview
);

/**
 * @swagger
 * /api/v1/review/{reviewId}:
 *   patch:
 *     summary: Moderate a review (isApproved/isFeatured) (Admin Only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               isApproved:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Review status updated
 */
router.patch(
    '/:reviewId',
    auth(USER_ROLE.ADMIN),
    ReviewController.updateReviewStatus
);

/**
 * @swagger
 * /api/v1/review/{reviewId}:
 *   delete:
 *     summary: Delete a review record (Admin Only)
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
 *         description: Review deleted successfully
 */
router.delete(
    '/:reviewId',
    auth(USER_ROLE.ADMIN),
    ReviewController.deleteReview
);

export const ReviewRoutes = router;