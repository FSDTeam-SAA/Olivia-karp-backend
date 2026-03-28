import express from 'express';
import { NewsletterController } from './newsletter.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middleware/validateRequest';
import { NewsletterValidation } from './newsletter.validation';


const router = express.Router();

// Public: Anyone can join
router.post(
    '/subscribe',
    validateRequest(NewsletterValidation.createSubscriptionZodSchema),
    NewsletterController.subscribe);

// Private: Only the Admin can see the list in the dashboard
router.get('/all-subscribers', auth(USER_ROLE.ADMIN), NewsletterController.getSubscribers);

// 2. Admin Routes (For Your Dashboard)
router.get(
    '/stats',
    auth(USER_ROLE.ADMIN, USER_ROLE.ADMIN),
    NewsletterController.getSubscriberStats
);

router.post(
    '/sync-retry',
    auth(USER_ROLE.ADMIN),
    NewsletterController.syncUnsyncedSubscribers
);

export const NewsletterRoutes = router;