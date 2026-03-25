import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import speakerController from "./speaker.controller";

const router = Router();

router.post(
  "/apply",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  speakerController.applyForSpeaker,
);

const speakerRouter = router;
export default speakerRouter;
