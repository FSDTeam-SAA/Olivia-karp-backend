import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { ApplyBlogController } from './applyBlog.controller';

/**
 * @swagger
 * tags:
 *   name: ApplyBlog
 *   description: API operations for ApplyBlog
 */



const router = express.Router();

/**
 * Public & User Routes
 */

// Any logged-in user (Non-Member, Member, or Owner) can submit a blog idea

/**
 * @swagger
 * /api/v1/applyBlog/submit-blog-idea:
 *   post:
 *     summary: POST endpoint for applyBlog
 *     tags: [ApplyBlog]
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
    '/submit-blog-idea',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    ApplyBlogController.submitBlogIdea
);

// Public can view published blogs (Filtering logic handled in Controller/Query)

/**
 * @swagger
 * /api/v1/applyBlog/get-all-blog-ideas:
 *   get:
 *     summary: GET endpoint for applyBlog
 *     tags: [ApplyBlog]
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
    '/get-all-blog-ideas',
    ApplyBlogController.getAllBlogs
);

// Public or User can view a single blog detail

/**
 * @swagger
 * /api/v1/applyBlog/get-single-blog/{applyBlogId}:
 *   get:
 *     summary: GET endpoint for applyBlog
 *     tags: [ApplyBlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applyBlogId
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
router.get(
    '/get-single-blog/:applyBlogId',
    ApplyBlogController.getSingleBlog
);

/**
 * Admin (Owner) Only Routes
 */

// Update status (pending -> accepted), content, or author details

/**
 * @swagger
 * /api/v1/applyBlog/update-blog/{applyBlogId}:
 *   patch:
 *     summary: PATCH endpoint for applyBlog
 *     tags: [ApplyBlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applyBlogId
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
    '/update-blog/:applyBlogId',
    auth(USER_ROLE.ADMIN),
    ApplyBlogController.updateBlog
);

// Remove a blog idea or a published post

/**
 * @swagger
 * /api/v1/applyBlog/delete-blog/{applyBlogId}:
 *   delete:
 *     summary: DELETE endpoint for applyBlog
 *     tags: [ApplyBlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applyBlogId
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
    '/delete-blog/:applyBlogId',
    auth(USER_ROLE.ADMIN),
    ApplyBlogController.deleteBlog
);

export const ApplyBlogRoutes = router;