import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import JobController from "./job.controller";

/**
 * @swagger
 * tags:
 *   name: Job
 *   description: Job board management including listings, company logos, and media (images/videos)
 */

const router = Router();

/**
 * @swagger
 * /api/v1/job/create-job:
 *   post:
 *     summary: Post a new job listing (Admin Only)
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *               companyName:
 *                 type: string
 *               jobType:
 *                 type: string
 *               location:
 *                 type: string
 *               skill:
 *                 type: string
 *               salaryRange:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 */
router.post(
  "/create-job",
  auth(USER_ROLE.ADMIN),
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 1 },
  ]),
  JobController.createNewJob,
);

/**
 * @swagger
 * /api/v1/job/all:
 *   get:
 *     summary: Retrieve all job listings with search and pagination
 *     tags: [Job]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, skill, jobType, or companyName
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
 *         description: List of jobs retrieved successfully
 */
router.get("/all", JobController.getAllJobs);

/**
 * @swagger
 * /api/v1/job/single/{jobId}:
 *   get:
 *     summary: Get full details of a single job
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details retrieved
 */
router.get("/single/:jobId", JobController.getSingleJob);

/**
 * @swagger
 * /api/v1/job/update-job/{jobId}:
 *   put:
 *     summary: Update an existing job listing (Admin Only)
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
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
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *               companyName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 */
router.put(
  "/update-job/:jobId",
  auth(USER_ROLE.ADMIN),
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 1 },
  ]),
  JobController.updateJob,
);

/**
 * @swagger
 * /api/v1/job/{jobId}:
 *   put:
 *     summary: Toggle job status (e.g. active/inactive)
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Job status updated successfully
 */
router.put("/:jobId", JobController.toggleJobStatus);
router.put("/delete/:jobId", JobController.toggleToDeleted);

const jobRouter = router;
export default jobRouter;

