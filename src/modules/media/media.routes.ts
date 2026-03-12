import express from 'express';
import { MediaController } from './media.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth';
import { MediaValidation } from './media.validation';
import validateRequest from '../../middleware/validateRequest';

const router = express.Router();

// Public Routes: Anyone can browse the media
router.get('/get-media', MediaController.getAllMedia);
router.get('/get-single-media/:mediaId', MediaController.getSingleMedia);

// Admin/Owner Routes: Only authorized users can modify content
router.post(
    '/create-media',
    auth(USER_ROLE.ADMIN, USER_ROLE.NON_MEMBER),
    validateRequest(MediaValidation.createMediaValidationSchema),
    MediaController.createMedia
);

router.patch(
    '/update-media/:mediaId',
    auth(USER_ROLE.ADMIN),
    validateRequest(MediaValidation.updateMediaValidationSchema),
    MediaController.updateMedia
);

router.delete(
    '/delete-media/:mediaId',
    auth(USER_ROLE.ADMIN),
    MediaController.deleteMedia
);

export const MediaRoutes = router;