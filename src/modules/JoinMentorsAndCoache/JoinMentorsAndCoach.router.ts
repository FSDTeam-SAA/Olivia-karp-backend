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

const joinMentorsAndCoachRouter = router;
export default joinMentorsAndCoachRouter;
