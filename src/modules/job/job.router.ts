import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import JobController from "./job.controller";

const router = Router();

router.post(
  "/create-job",
  auth(USER_ROLE.ADMIN),
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 1 },
  ]),
  JobController.createNewJob,
);

router.get("/all", JobController.getAllJobs);

const jobRouter = router;
export default jobRouter;
