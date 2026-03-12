import express from 'express';
import { MediaController } from './media.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth';
import { MediaValidation } from './media.validation';
import validateRequest from '../../middleware/validateRequest';

const router = express.Router();

// Public Routes: Anyone can browse the media
router.get('/', MediaController.getAllMedia);
router.get('/:mediaId', MediaController.getSingleMedia);

// Admin/Owner Routes: Only authorized users can modify content
router.post(
    '/create-media',
    auth(USER_ROLE.ADMIN),
    validateRequest(MediaValidation.createMediaValidationSchema),
    MediaController.createMedia
);

router.patch(
    '/:mediaId',
    auth(USER_ROLE.ADMIN),
    validateRequest(MediaValidation.updateMediaValidationSchema),
    MediaController.updateMedia
);

router.delete(
    '/:mediaId',
    auth(USER_ROLE.ADMIN),
    MediaController.deleteMedia
);

export const MediaRoutes = router;