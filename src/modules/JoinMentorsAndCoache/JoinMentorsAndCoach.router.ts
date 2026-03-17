import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import JoinMentorsAndCoachController from "./JoinMentorsAndCoach.controller";

const router = Router();

router.post(
  "/join",
  upload.single("file"),
  JoinMentorsAndCoachController.createJoinMentorsAndCoachIntoDB,
);

router.get("/all", JoinMentorsAndCoachController.getAllJoinMentorsAndCoaches);

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
