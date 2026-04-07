import { Router } from "express";
import analyticsController from "./analytics.controller";

const router = Router();

router.get("/course", analyticsController.getCourserAnalytics);

const analyticsRouter = router;
export default analyticsRouter;
