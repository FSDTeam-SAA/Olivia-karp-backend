import { Router } from "express";

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Video course modules, lessons, and base pricing configurations.
 */
import { upload } from "../../middleware/multer.middleware";
import courseController from "./course.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/course/create:
 *   post:
 *     summary: Create a new course (Form-Data)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Course successfully created
 */
router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 5 }]),
  courseController.CreateNewCourse,
);

/**
 * @swagger
 * /api/v1/course/all:
 *   get:
 *     summary: Get all courses (Paginated)
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A paginated list of courses
 */
router.get("/all", courseController.getAllCourses);

/**
 * @swagger
 * /api/v1/course/{courseId}:
 *   get:
 *     summary: Get a single course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details and lessons
 */
router.get("/:courseId", courseController.getSingleCourse);

const courseRouter = router;
export default courseRouter;
