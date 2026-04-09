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
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, NON_MEMBER]
 *     responses:
 *       201:
 *         description: User registered successfully. OTP sent to email.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
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
 *     summary: Verify email using OTP
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *     summary: Resend OTP for email verification
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP resent successfully
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
 *     summary: Retrieve all users (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *     summary: Update user profile details and image
 *     tags: [User]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               street:
 *                 type: string
 *               location:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
