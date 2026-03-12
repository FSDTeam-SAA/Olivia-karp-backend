import express from 'express';
import { BlogControllers } from './blog.controller';
import validateRequest from '../../middleware/validateRequest';
import { BlogValidations } from './blog.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { upload } from '../../middleware/multer.middleware';
import parseData from '../../middleware/parseData';

const router = express.Router();

/**
 * Public Routes
 * These power the "Our Blog" page and "Expert Insights" sections
 */
router.get(
    '/get-blogs',
    BlogControllers.getAllBlogs
);

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

router.delete(
    '/delete-blog/:blogId',
    auth(USER_ROLE.ADMIN),
    BlogControllers.deleteBlog
);

export const BlogRoutes = router;