import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import ApplyJobController from "./applyJob.controller";

/**
 * @swagger
 * tags:
 *   name: ApplyJob
 *   description: Managing job applications and candidate submissions
 */

const router = Router();


/**
 * @swagger
 * /api/v1/applyJob/apply:
 *   post:
 *     summary: Submit a job application (Non-Member/Member)
 *     tags: [ApplyJob]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Resume/CV file
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application submitted successfully
 */
router.post(
  "/apply",
  upload.single("file"),
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  ApplyJobController.applyForJob,
);


/**
 * @swagger
 * /api/v1/applyJob/all:
 *   get:
 *     summary: Retrieve all job applications with filters (Admin Only)
 *     tags: [ApplyJob]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by job title, category, or candidate name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (comma-separated, e.g. pending,reviewed)
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
 *         description: List of applied jobs retrieved
 */
router.get("/all", auth(USER_ROLE.ADMIN), ApplyJobController.getAllAppliedJobs);


/**
 * @swagger
 * /api/v1/applyJob/{id}:
 *   get:
 *     summary: Get details of a single job application (Admin Only)
 *     tags: [ApplyJob]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details retrieved
 */
router.get(
  "/:id",
    auth(USER_ROLE.ADMIN),
  ApplyJobController.getSingleAppliedJob,
);


/**
 * @swagger
 * /api/v1/applyJob/update/{id}:
 *   put:
 *     summary: Update the status of a job application (Admin Only)
 *     tags: [ApplyJob]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 example: "reviewed"
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put(
  "/update/:id",
  auth(USER_ROLE.ADMIN),
  ApplyJobController.updateStatus,
);

const applyJobRouter = router;
export default applyJobRouter;

