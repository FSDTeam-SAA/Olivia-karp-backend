import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import courseController from "./course.controller";

const router = Router();

router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 5 }]),
  courseController.CreateNewCourse,
);

router.get("/all", courseController.getAllCourses);

const courseRouter = router;
export default courseRouter;
