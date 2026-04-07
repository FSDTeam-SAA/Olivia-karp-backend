import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "./user.constant";
import userController from "./user.controller";
import { userValidation } from "./user.validation";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API operations for User
 */


const router = Router();


/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: POST endpoint for user
 *     tags: [User]
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
  "/register",
  validateRequest(userValidation.userValidationSchema),
  userController.registerUser,
);


/**
 * @swagger
 * /api/v1/user/verify-email:
 *   post:
 *     summary: POST endpoint for user
 *     tags: [User]
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
  "/verify-email",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.verifyEmail,
);


/**
 * @swagger
 * /api/v1/user/resend-otp:
 *   post:
 *     summary: POST endpoint for user
 *     tags: [User]
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
  "/resend-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.resendOtpCode,
);


/**
 * @swagger
 * /api/v1/user/all-users:
 *   get:
 *     summary: GET endpoint for user
 *     tags: [User]
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
router.get("/all-users",  userController.getAllUsers);

/**
 * @swagger
 * /api/v1/user/my-profile:
 *   get:
 *     summary: GET endpoint for user
 *     tags: [User]
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
  "/my-profile",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.getMyProfile,
);


/**
 * @swagger
 * /api/v1/user/update-profile:
 *   put:
 *     summary: PUT endpoint for user
 *     tags: [User]
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
router.put(
  "/update-profile",
  upload.single("image"),
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.updateUserProfile,
);


/**
 * @swagger
 * /api/v1/user/admin_id:
 *   get:
 *     summary: GET endpoint for user
 *     tags: [User]
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
  "/admin_id",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.getAdminId,
);

const userRouter = router;
export default userRouter;
