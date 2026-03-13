import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { CourseIdeaValidations } from './course.validation';
import { CourseIdeaControllers } from './course.controller';

const router = express.Router();

/**
 * USER & ADMIN ROUTES
 * Both roles can submit ideas and see their own personal submission history
 */
router.post(
    '/submit-idea',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    validateRequest(CourseIdeaValidations.createCourseIdeaValidationSchema),
    CourseIdeaControllers.submitIdea
);

router.get(
    '/my-ideas',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    // CourseIdeaControllers
);

/**
 * ADMIN ONLY ROUTES
 * Only Admins can see every submission and change their status
 */
router.get(
    '/all-ideas',
    auth(USER_ROLE.ADMIN),
    // CourseIdeaControllers.getAllIdeas
);

router.patch(
    '/update-status/:courseId',
    auth(USER_ROLE.ADMIN),
    // validateRequest(CourseIdeaValidations.updateStatusValidationSchema),
    // CourseIdeaControllers.updateIdeaStatus
);

router.delete(
    '/delete-idea/:courseId',
    auth(USER_ROLE.ADMIN),
    // Course
)

export const CourseIdeaRoutes = router;