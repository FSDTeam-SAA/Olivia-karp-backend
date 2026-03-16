import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { ApplyBlogController } from './applyBlog.controller';


const router = express.Router();

/**
 * Public & User Routes
 */

// Any logged-in user (Non-Member, Member, or Owner) can submit a blog idea
router.post(
    '/submit-blog-idea',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    ApplyBlogController.submitBlogIdea
);

// Public can view published blogs (Filtering logic handled in Controller/Query)
router.get(
    '/get-all-blog-ideas',
    ApplyBlogController.getAllBlogs
);

// Public or User can view a single blog detail
router.get(
    '/get-single-blog/:applyBlogId',
    ApplyBlogController.getSingleBlog
);

/**
 * Admin (Owner) Only Routes
 */

// Update status (pending -> accepted), content, or author details
router.patch(
    '/update-blog/:applyBlogId',
    auth(USER_ROLE.ADMIN),
    ApplyBlogController.updateBlog
);

// Remove a blog idea or a published post
router.delete(
    '/delete-blog/:applyBlogId',
    auth(USER_ROLE.ADMIN),
    ApplyBlogController.deleteBlog
);

export const ApplyBlogRoutes = router;