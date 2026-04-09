import express from 'express';
import { BlogControllers } from './blog.controller';
import validateRequest from '../../middleware/validateRequest';
import { BlogValidations } from './blog.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { upload } from '../../middleware/multer.middleware';
import parseData from '../../middleware/parseData';

/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Managing blog posts, expert insights, and climate career articles
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/blog/get-blogs:
 *   get:
 *     summary: Retrieve all blogs with filtering and searching
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by title or content
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['Expert Insights', 'Climate Careers', 'Research', 'Toolkit', 'Renewable Energy']
 *         description: Filter by category
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured blogs
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
 *         description: List of blogs retrieved successfully
 */
router.get(
    '/get-blogs',
    BlogControllers.getAllBlogs
);

/**
 * @swagger
 * /api/v1/blog/get-single-blog/{blogId}:
 *   get:
 *     summary: Get details of a specific blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details retrieved
 */
router.get(
    '/get-single-blog/:blogId',
    BlogControllers.getSingleBlog
);

/**
 * @swagger
 * /api/v1/blog/create-blog:
 *   post:
 *     summary: Create a new blog post (Admin Only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Author's profile image
 *               data:
 *                 type: string
 *                 description: JSON string of blog data (title, category, content, author, etc.)
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
router.post(
    '/create-blog',
    auth(USER_ROLE.ADMIN),
    upload.fields([
        { name: 'thumbnailImage', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 },
    ]),
    parseData,
    validateRequest(BlogValidations.createBlogValidationSchema),
    BlogControllers.createBlog,
);

/**
 * @swagger
 * /api/v1/blog/update-blog/{blogId}:
 *   patch:
 *     summary: Update an existing blog post (Admin Only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnailImage:
 *                 type: string
 *                 format: binary
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *                 description: JSON string of fields to update
 *     responses:
 *       200:
 *         description: Blog updated successfully
 */
router.patch(
    '/update-blog/:blogId',
    auth(USER_ROLE.ADMIN),
    upload.fields([
        { name: 'thumbnailImage', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 },
    ]),
    parseData,
    validateRequest(BlogValidations.updateBlogValidationSchema),
    BlogControllers.updateBlog
);

/**
 * @swagger
 * /api/v1/blog/delete-blog/{blogId}:
 *   delete:
 *     summary: Delete a blog post (Admin Only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 */
router.delete(
    '/delete-blog/:blogId',
    auth(USER_ROLE.ADMIN),
    BlogControllers.deleteBlog
);

export const BlogRoutes = router;