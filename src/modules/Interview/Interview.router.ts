import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import InterviewController from "./Interview.controller";

/**
 * @swagger
 * tags:
 *   name: Interview
 *   description: API operations for Interview
 */


const router = Router();


/**
 * @swagger
 * /api/v1/Interview/create:
 *   post:
 *     summary: POST endpoint for Interview
 *     tags: [Interview]
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
  "/create",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  InterviewController.createInterview,
);


/**
 * @swagger
 * /api/v1/Interview:
 *   get:
 *     summary: GET endpoint for Interview
 *     tags: [Interview]
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
router.get("/", auth(USER_ROLE.ADMIN), InterviewController.getAllInterviews);


/**
 * @swagger
 * /api/v1/Interview/{id}:
 *   get:
 *     summary: GET endpoint for Interview
 *     tags: [Interview]
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
  InterviewController.getSingleInterview,
);


/**
 * @swagger
 * /api/v1/Interview/update/{id}:
 *   put:
 *     summary: PUT endpoint for Interview
 *     tags: [Interview]
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
  // auth(USER_ROLE.ADMIN),
  InterviewController.updateStatus,
);

const InterviewRouter = router;
export default InterviewRouter;
