import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import speakerController from "./speaker.controller";

/**
 * @swagger
 * tags:
 *   name: Speaker
 *   description: API operations for Speaker
 */


const router = Router();


/**
 * @swagger
 * /api/v1/speaker/apply:
 *   post:
 *     summary: POST endpoint for speaker
 *     tags: [Speaker]
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
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  speakerController.applyForSpeaker,
);


/**
 * @swagger
 * /api/v1/speaker/all:
 *   get:
 *     summary: GET endpoint for speaker
 *     tags: [Speaker]
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
  "/all",
  //   auth(USER_ROLE.ADMIN),
  speakerController.getAllAppliedSpeakers,
);


/**
 * @swagger
 * /api/v1/speaker/{id}:
 *   get:
 *     summary: GET endpoint for speaker
 *     tags: [Speaker]
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
  //   auth(USER_ROLE.ADMIN),
  speakerController.getSingleDetailsForSpeaker,
);


/**
 * @swagger
 * /api/v1/speaker/update/{id}:
 *   put:
 *     summary: PUT endpoint for speaker
 *     tags: [Speaker]
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
  //   auth(USER_ROLE.ADMIN),
  speakerController.updateStatus,
);

const speakerRouter = router;
export default speakerRouter;
