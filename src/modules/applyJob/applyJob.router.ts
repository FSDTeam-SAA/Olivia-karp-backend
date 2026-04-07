import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import ApplyJobController from "./applyJob.controller";

/**
 * @swagger
 * tags:
 *   name: ApplyJob
 *   description: API operations for ApplyJob
 */


const router = Router();


/**
 * @swagger
 * /api/v1/applyJob/apply:
 *   post:
 *     summary: POST endpoint for applyJob
 *     tags: [ApplyJob]
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
  "/apply",
  upload.single("file"),
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  ApplyJobController.applyForJob,
);


/**
 * @swagger
 * /api/v1/applyJob/all:
 *   get:
 *     summary: GET endpoint for applyJob
 *     tags: [ApplyJob]
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
router.get("/all", auth(USER_ROLE.ADMIN), ApplyJobController.getAllAppliedJobs);


/**
 * @swagger
 * /api/v1/applyJob/{id}:
 *   get:
 *     summary: GET endpoint for applyJob
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *     summary: PUT endpoint for applyJob
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
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put(
  "/update/:id",
  auth(USER_ROLE.ADMIN),
  ApplyJobController.updateStatus,
);

const applyJobRouter = router;
export default applyJobRouter;
