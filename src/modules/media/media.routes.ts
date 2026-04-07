import express from 'express';
import { MediaController } from './media.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth';
import { MediaValidation } from './media.validation';
import validateRequest from '../../middleware/validateRequest';

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: API operations for Media
 */


const router = express.Router();

// Public Routes: Anyone can browse the media

/**
 * @swagger
 * /api/v1/media/get-media:
 *   get:
 *     summary: GET endpoint for media
 *     tags: [Media]
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
router.get('/get-media', MediaController.getAllMedia);

/**
 * @swagger
 * /api/v1/media/get-single-media/{mediaId}:
 *   get:
 *     summary: GET endpoint for media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
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
router.get('/get-single-media/:mediaId', MediaController.getSingleMedia);

// Admin/Owner Routes: Only authorized users can modify content

/**
 * @swagger
 * /api/v1/media/create-media:
 *   post:
 *     summary: POST endpoint for media
 *     tags: [Media]
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
    '/create-media',
    auth(USER_ROLE.ADMIN, USER_ROLE.NON_MEMBER),
    validateRequest(MediaValidation.createMediaValidationSchema),
    MediaController.createMedia
);


/**
 * @swagger
 * /api/v1/media/update-media/{mediaId}:
 *   patch:
 *     summary: PATCH endpoint for media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
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
    '/update-media/:mediaId',
    auth(USER_ROLE.ADMIN),
    validateRequest(MediaValidation.updateMediaValidationSchema),
    MediaController.updateMedia
);


/**
 * @swagger
 * /api/v1/media/delete-media/{mediaId}:
 *   delete:
 *     summary: DELETE endpoint for media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
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
    '/delete-media/:mediaId',
    auth(USER_ROLE.ADMIN),
    MediaController.deleteMedia
);

export const MediaRoutes = router;