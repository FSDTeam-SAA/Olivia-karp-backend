import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import auth from "../../middleware/auth";
import { loginLimiter } from "../../middleware/security";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import authController from "./auth.controller";
import { authValidationSchema } from "./auth.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication workflows including login, tokens, and password reset
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecretPass123!
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/login",
  loginLimiter,
  validateRequest(authValidationSchema.authValidation),
  authController.login,
);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns a new access token
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent to your email
 */
router.post("/forgot-password", authController.forgotPassword);


/**
 * @swagger
 * /api/v1/auth/resend-forgot-otp:
 *   post:
 *     summary: POST endpoint for auth
 *     tags: [Auth]
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
  "/resend-forgot-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.resendForgotOtpCode,
);


/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: POST endpoint for auth
 *     tags: [Auth]
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
  "/verify-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.verifyOtp,
);


/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: POST endpoint for auth
 *     tags: [Auth]
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
  "/reset-password",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.resetPassword,
);


/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: POST endpoint for auth
 *     tags: [Auth]
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
  "/change-password",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.changePassword,
);


/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: GET endpoint for auth
 *     tags: [Auth]
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
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = (req.query.redirect as string) || "/";

    passport.authenticate("google", {
      scope: ["email", "profile"],
      state: redirect,
    })(req, res, next);
  },
);


/**
 * @swagger
 * /api/v1/auth/facebook:
 *   get:
 *     summary: GET endpoint for auth
 *     tags: [Auth]
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
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] }),
);


/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: GET endpoint for auth
 *     tags: [Auth]
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
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback,
);


/**
 * @swagger
 * /api/v1/auth/facebook/callback:
 *   get:
 *     summary: GET endpoint for auth
 *     tags: [Auth]
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
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/login",
  }),
  authController.facebookCallBack,
);

const authRouter = router;
export default authRouter;
