import express from 'express';
import { MediaController } from './media.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth';
import { MediaValidation } from './media.validation';
import validateRequest from '../../middleware/validateRequest';
import { upload } from '../../middleware/multer.middleware';

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Managing media content including videos, podcasts, event recordings, and expert interviews
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/media/get-media:
 *   get:
 *     summary: Retrieve all media posts with filtering and search
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: mediaType
 *         schema:
 *           type: string
 *           enum: ['video', 'podcast', 'event-recording', 'expert-interview', 'insight', 'blog', 'resource']
 *         description: Filter by media type
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured media
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by publication status
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
 *         description: List of media posts retrieved successfully
 */
router.get('/get-media', MediaController.getAllMedia);

/**
 * @swagger
 * /api/v1/media/get-single-media/{mediaId}:
 *   get:
 *     summary: Get details of a single media post
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media post details retrieved
 */
router.get('/get-single-media/:mediaId', MediaController.getSingleMedia);

/**
 * @swagger
 * /api/v1/media/create-media:
 *   post:
 *     summary: Create a new media entry (Admin Only)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - mediaType
 *               - sourceType
 *               - contentUrl
 *             properties:
 *               title:
 *                 type: string
 *               mediaType:
 *                 type: string
 *                 enum: ['video', 'podcast', 'event-recording', 'expert-interview', 'insight', 'blog', 'resource']
 *               sourceType:
 *                 type: string
 *                 example: "URL"
 *               contentUrl:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=..."
 *               description:
 *                 type: string
 *               thumbnailImage:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Media created successfully
 */
router.post(
    '/create-media',
    auth(USER_ROLE.ADMIN, USER_ROLE.NON_MEMBER),
    // 1. Multer middleware intercepts the 'thumbnailImage' file
    upload.single('thumbnailImage'), 
    // 2. Controller handles the logic
    MediaController.createMedia
);

/**
 * @swagger
 * /api/v1/media/update-media/{mediaId}:
 *   patch:
 *     summary: Update an existing media entry (Admin Only)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
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
 *               title:
 *                 type: string
 *               mediaType:
 *                 type: string
 *               contentUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Media updated successfully
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
 *     summary: Delete a media entry (Admin Only)
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
 *         description: Media deleted successfully
 */
router.delete(
    '/delete-media/:mediaId',
    auth(USER_ROLE.ADMIN),
    MediaController.deleteMedia
);

export const MediaRoutes = router;