import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import ApplyJobController from "./applyJob.controller";

const router = Router();

router.post(
  "/apply",
  upload.single("file"),
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  ApplyJobController.applyForJob,
);

router.get("/all",  ApplyJobController.getAllAppliedJobs);

const applyJobRouter = router;
export default applyJobRouter;
