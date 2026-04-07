import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { CourseIdeaValidations } from './courseIdea.validation';
import { CourseIdeaControllers } from './courseIdea.controller';

/**
 * @swagger
 * tags:
 *   name: CourseIdea
 *   description: API operations for CourseIdea
 */


const router = express.Router();


router.post(
    '/submit-idea',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN, USER_ROLE.MEMBER),
    validateRequest(CourseIdeaValidations.createCourseIdeaValidationSchema),
    CourseIdeaControllers.submitIdea
);


/**
 * @swagger
 * /api/v1/courseIdea/course-ideas:
 *   get:
 *     summary: GET endpoint for courseIdea
 *     tags: [CourseIdea]
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
    '/course-ideas',
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    CourseIdeaControllers.getAllIdeas
);


/**
 * @swagger
 * /api/v1/courseIdea/get-idea/{courseIdeaId}:
 *   get:
 *     summary: GET endpoint for courseIdea
 *     tags: [CourseIdea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseIdeaId
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
    '/get-idea/:courseIdeaId', // Match this...
    auth(USER_ROLE.NON_MEMBER, USER_ROLE.ADMIN),
    CourseIdeaControllers.getSingleIdea
);


/**
 * @swagger
 * /api/v1/courseIdea/update-status/{courseIdeaId}:
 *   patch:
 *     summary: PATCH endpoint for courseIdea
 *     tags: [CourseIdea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseIdeaId
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
    '/update-status/:courseIdeaId',
    auth(USER_ROLE.ADMIN),
    // validateRequest(CourseIdeaValidations.updateStatusValidationSchema),
    CourseIdeaControllers.updateIdeaStatus
);


/**
 * @swagger
 * /api/v1/courseIdea/delete-idea/{courseIdeaId}:
 *   delete:
 *     summary: DELETE endpoint for courseIdea
 *     tags: [CourseIdea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseIdeaId
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
    '/delete-idea/:courseIdeaId',
    auth(USER_ROLE.ADMIN),
    CourseIdeaControllers.deleteCourseIdea
)

export const CourseIdeaRoutes = router;