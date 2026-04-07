import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import enrollCourseController from "./enrollCourse.controller";

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  enrollCourseController.createEnrollCourse,
);

const enrollCourseRouter = router;
export default enrollCourseRouter;
