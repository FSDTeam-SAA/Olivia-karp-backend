import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { CourseIdeaValidations } from './courseIdea.validation';
import { CourseIdeaControllers } from './courseIdea.controller';

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
    '/course-ideas',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    CourseIdeaControllers.getAllIdeas
);

router.get(
    '/get-idea/:courseIdeaId', // Match this...
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    CourseIdeaControllers.getSingleIdea
);

router.patch(
    '/update-status/:courseIdeaId',
    auth(USER_ROLE.ADMIN),
    // validateRequest(CourseIdeaValidations.updateStatusValidationSchema),
    CourseIdeaControllers.updateIdeaStatus
);

router.delete(
    '/delete-idea/:courseIdeaId',
    auth(USER_ROLE.ADMIN),
    CourseIdeaControllers.deleteCourseIdea
)

export const CourseIdeaRoutes = router;