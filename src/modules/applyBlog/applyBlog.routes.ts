import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { ApplyBlogController } from './applyBlog.controller';

/**
 * @swagger
 * tags:
 *   name: ApplyBlog
 *   description: Managing guest blog submissions (ideas) and pending articles
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/applyBlog/submit-blog-idea:
 *   post:
 *     summary: Submit a new blog idea for review
 *     tags: [ApplyBlog]
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
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: ['Expert Insights', 'Climate Careers', 'Research', 'Toolkit', 'Renewable Energy']
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Idea submitted successfully
 */
router.post(
    '/submit-blog-idea',
    auth(USER_ROLE.NON_MEMBER),
    ApplyBlogController.submitBlogIdea
);

/**
 * @swagger
 * /api/v1/applyBlog/get-all-blog-ideas:
 *   get:
 *     summary: Retrieve all blog ideas with filtering (Admin/Public)
 *     tags: [ApplyBlog]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'published', 'reviewed', 'accepted', 'rejected']
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of blog ideas
 */
router.get(
    '/get-all-blog-ideas',
    ApplyBlogController.getAllBlogs
);

/**
 * @swagger
 * /api/v1/applyBlog/get-single-blog/{applyBlogId}:
 *   get:
 *     summary: Get details of a single blog idea
 *     tags: [ApplyBlog]
 *     parameters:
 *       - in: path
 *         name: applyBlogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog idea details
 */
router.get(
    '/get-single-blog/:applyBlogId',
    ApplyBlogController.getSingleBlog
);

/**
 * @swagger
 * /api/v1/applyBlog/update-blog/{applyBlogId}:
 *   patch:
 *     summary: Update blog idea status or content (Admin Only)
 *     tags: [ApplyBlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applyBlogId
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
 *               status:
 *                 type: string
 *                 enum: ['pending', 'published', 'reviewed', 'accepted', 'rejected']
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog idea updated
 */
router.patch(
    '/update-blog/:applyBlogId',
    auth(USER_ROLE.ADMIN),
    ApplyBlogController.updateBlog
);

/**
 * @swagger
 * /api/v1/applyBlog/delete-blog/{applyBlogId}:
 *   delete:
 *     summary: Delete a blog idea record (Admin Only)
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
 *         description: Record deleted successfully
 */
router.delete(
    '/delete-blog/:applyBlogId',
    auth(USER_ROLE.ADMIN),
    ApplyBlogController.deleteBlog
);

export const ApplyBlogRoutes = router;