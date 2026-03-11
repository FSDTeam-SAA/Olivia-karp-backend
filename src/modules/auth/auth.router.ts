import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import auth from "../../middleware/auth";
import { loginLimiter } from "../../middleware/security";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import authController from "./auth.controller";
import { authValidationSchema } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  loginLimiter,
  validateRequest(authValidationSchema.authValidation),
  authController.login,
);

router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

router.post(
  "/resend-forgot-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.resendForgotOtpCode,
);

router.post(
  "/verify-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.verifyOtp,
);

router.post(
  "/reset-password",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.resetPassword,
);

router.post(
  "/change-password",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  authController.changePassword,
);

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

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback,
);

const authRouter = router;
export default authRouter;
