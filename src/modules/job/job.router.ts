import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import JobController from "./job.controller";

/**
 * @swagger
 * tags:
 *   name: Job
 *   description: API operations for Job
 */

const router = Router();

/**
 * @swagger
 * /api/v1/job/create-job:
 *   post:
 *     summary: POST endpoint for job
 *     tags: [Job]
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
 *     summary: GET endpoint for job
 *     tags: [Job]
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
router.get("/all", JobController.getAllJobs);

/**
 * @swagger
 * /api/v1/job/single/{jobId}:
 *   get:
 *     summary: GET endpoint for job
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
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
router.get("/single/:jobId", JobController.getSingleJob);

/**
 * @swagger
 * /api/v1/job/update-job/{jobId}:
 *   put:
 *     summary: PUT endpoint for job
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
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

router.put("/:jobId", JobController.toggleJobStatus);

const jobRouter = router;
export default jobRouter;
