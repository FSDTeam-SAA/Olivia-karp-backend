import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "./user.constant";
import userController from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidation.userValidationSchema),
  userController.registerUser,
);

router.post(
  "/verify-email",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.verifyEmail,
);

router.post(
  "/resend-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.resendOtpCode,
);

router.get("/all-users",  userController.getAllUsers);
router.get(
  "/my-profile",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.getMyProfile,
);

router.put(
  "/update-profile",
  upload.single("image"),
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.updateUserProfile,
);

router.get(
  "/admin_id",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),

  userController.getAdminId,
);

const userRouter = router;
export default userRouter;
