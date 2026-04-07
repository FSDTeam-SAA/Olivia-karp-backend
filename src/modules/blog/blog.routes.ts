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
 *   description: API operations for Blog
 */


const router = express.Router();

/**
 * Public Routes
 * These power the "Our Blog" page and "Expert Insights" sections
 */
router.get(
    '/get-blogs',
    BlogControllers.getAllBlogs
);


/**
 * @swagger
 * /api/v1/blog/get-single-blog/{blogId}:
 *   get:
 *     summary: GET endpoint for blog
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
    '/get-single-blog/:blogId',
    BlogControllers.getSingleBlog
);

/**
 * Admin Routes
 * Restricted to ADMIN/OWNER for managing the dashboard content
 */
router.post(
    '/create-blog',
    auth(USER_ROLE.ADMIN, USER_ROLE.NON_MEMBER),
    upload.fields([
        { name: 'thumbnailImage', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 },
    ]),
    parseData, // <--- Clean and Reusable
    validateRequest(BlogValidations.createBlogValidationSchema),
    BlogControllers.createBlog,
);


/**
 * @swagger
 * /api/v1/blog/update-blog/{blogId}:
 *   patch:
 *     summary: PATCH endpoint for blog
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
    '/update-blog/:blogId',
    auth(USER_ROLE.ADMIN),
    upload.fields([ // 1. Multer runs first to populate req.body and req.files
        { name: 'thumbnailImage', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 },
    ]),
    parseData, // <--- Clean and Reusable
    validateRequest(BlogValidations.updateBlogValidationSchema),
    BlogControllers.updateBlog
);


/**
 * @swagger
 * /api/v1/blog/delete-blog/{blogId}:
 *   delete:
 *     summary: DELETE endpoint for blog
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete(
    '/delete-blog/:blogId',
    auth(USER_ROLE.ADMIN),
    BlogControllers.deleteBlog
);

export const BlogRoutes = router;