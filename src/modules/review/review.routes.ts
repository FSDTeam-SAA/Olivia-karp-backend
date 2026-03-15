import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import { ReviewController } from './review.controller';
import auth from '../../middleware/auth';


const router = express.Router();

// Public: Landing page needs these
router.get('/all', ReviewController.getAllReviews);
router.get('/approved', ReviewController.getApprovedReviews);

// User: Only logged-in users can post
router.post(
    '/submit-review',
    auth(USER_ROLE.NON_MEMBER), // Replace with your TUserRole logic
    ReviewController.createReview
);

// Admin: Only owners can manage
router.patch(
    '/:reviewId',
    auth(USER_ROLE.ADMIN), // Using your updated 'owner' naming convention
    ReviewController.updateReviewStatus
);

router.delete(
    '/:reviewId',
    auth(USER_ROLE.ADMIN),
    ReviewController.deleteReview
);

export const ReviewRoutes = router;