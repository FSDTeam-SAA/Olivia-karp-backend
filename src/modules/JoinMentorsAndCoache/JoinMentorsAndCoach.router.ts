import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import JoinMentorsAndCoachController from "./JoinMentorsAndCoach.controller";

const router = Router();

router.post(
  "/join",
  auth(USER_ROLE.ADMIN, USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
  upload.single("file"),
  JoinMentorsAndCoachController.createJoinMentorsAndCoachIntoDB,
);

router.get("/all", JoinMentorsAndCoachController.getAllJoinMentorsAndCoaches);

router.get(
  "/",
  JoinMentorsAndCoachController.getApprovedJoinMentorsAndCoaches,
);

router.get(
  "/:joinMentorsAndCoachId",
  JoinMentorsAndCoachController.getSingleJoinMentorsAndCoach,
);

router.put(
  "/approved/:joinMentorsAndCoachId",
  JoinMentorsAndCoachController.approvedJoinMentorsAndCoach,
);

router.put(
  "/toggle/:joinMentorsAndCoachId",
  JoinMentorsAndCoachController.toggleMentorAndCoachActive,
);

const joinMentorsAndCoachRouter = router;
export default joinMentorsAndCoachRouter;
