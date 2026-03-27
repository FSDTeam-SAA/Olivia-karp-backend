import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import InterviewController from "./Interview.controller";

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  InterviewController.createInterview,
);

router.get(
  "/",
  auth(USER_ROLE.ADMIN),
  InterviewController.getAllInterviews,
);

router.get(
  "/:id",
  // auth(USER_ROLE.ADMIN),
  InterviewController.getSingleInterview,
);

const InterviewRouter = router;
export default InterviewRouter;
