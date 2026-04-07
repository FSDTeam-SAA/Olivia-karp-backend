import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import JoinMentorsAndCoachController from "./JoinMentorsAndCoach.controller";

/**
 * @swagger
 * tags:
 *   name: JoinMentorsAndCoache
 *   description: API operations for JoinMentorsAndCoache
 */


const router = Router();


/**
 * @swagger
 * /api/v1/JoinMentorsAndCoache/join:
 *   post:
 *     summary: POST endpoint for JoinMentorsAndCoache
 *     tags: [JoinMentorsAndCoache]
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
  "/join",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  upload.single("file"),
  JoinMentorsAndCoachController.createJoinMentorsAndCoachIntoDB,
);


/**
 * @swagger
 * /api/v1/JoinMentorsAndCoache/all:
 *   get:
 *     summary: GET endpoint for JoinMentorsAndCoache
 *     tags: [JoinMentorsAndCoache]
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
router.get("/all", JoinMentorsAndCoachController.getAllJoinMentorsAndCoaches);


/**
 * @swagger
 * /api/v1/JoinMentorsAndCoache:
 *   get:
 *     summary: GET endpoint for JoinMentorsAndCoache
 *     tags: [JoinMentorsAndCoache]
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
  "/",
  JoinMentorsAndCoachController.getApprovedJoinMentorsAndCoaches,
);


/**
 * @swagger
 * /api/v1/JoinMentorsAndCoache/{joinMentorsAndCoachId}:
 *   get:
 *     summary: GET endpoint for JoinMentorsAndCoache
 *     tags: [JoinMentorsAndCoache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: joinMentorsAndCoachId
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
  "/:joinMentorsAndCoachId",
  JoinMentorsAndCoachController.getSingleJoinMentorsAndCoach,
);


/**
 * @swagger
 * /api/v1/JoinMentorsAndCoache/approved/{joinMentorsAndCoachId}:
 *   put:
 *     summary: PUT endpoint for JoinMentorsAndCoache
 *     tags: [JoinMentorsAndCoache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: joinMentorsAndCoachId
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
  "/approved/:joinMentorsAndCoachId",
  JoinMentorsAndCoachController.approvedJoinMentorsAndCoach,
);


/**
 * @swagger
 * /api/v1/JoinMentorsAndCoache/toggle/{joinMentorsAndCoachId}:
 *   put:
 *     summary: PUT endpoint for JoinMentorsAndCoache
 *     tags: [JoinMentorsAndCoache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: joinMentorsAndCoachId
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
  "/toggle/:joinMentorsAndCoachId",
  JoinMentorsAndCoachController.toggleMentorAndCoachActive,
);

const joinMentorsAndCoachRouter = router;
export default joinMentorsAndCoachRouter;
