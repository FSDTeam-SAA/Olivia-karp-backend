import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import enrollCourseController from "./enrollCourse.controller";

/**
 * @swagger
 * tags:
 *   name: Enrollment
 *   description: Course enrollment and student tracking for Act On Pricing education modules
 */

const router = Router();

/**
 * @swagger
 * /api/v1/enrollment/create:
 *   post:
 *     summary: Enroll a user in a course
 *     tags: [Enrollment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully enrolled
 */
router.post(
  "/create",
  auth(USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  enrollCourseController.createEnrollCourse,
);

const enrollCourseRouter = router;
export default enrollCourseRouter;


