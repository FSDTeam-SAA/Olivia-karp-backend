import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import surveyController from "./survey.controller";

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.NON_MEMBER),
  surveyController.createNewSurvey,
);

const surveyRouter = router;
export default surveyRouter;
