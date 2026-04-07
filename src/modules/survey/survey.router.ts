import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import surveyController from "./survey.controller";

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: API operations for Survey
 */


const router = Router();


/**
 * @swagger
 * /api/v1/survey/create:
 *   post:
 *     summary: POST endpoint for survey
 *     tags: [Survey]
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
  auth(USER_ROLE.NON_MEMBER),
  surveyController.createNewSurvey,
);


/**
 * @swagger
 * /api/v1/survey:
 *   get:
 *     summary: GET endpoint for survey
 *     tags: [Survey]
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
router.get("/", auth(USER_ROLE.ADMIN), surveyController.getAllSurveys);


/**
 * @swagger
 * /api/v1/survey/{id}:
 *   get:
 *     summary: GET endpoint for survey
 *     tags: [Survey]
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
router.get("/:id", surveyController.getSingleSurvey);

const surveyRouter = router;
export default surveyRouter;
