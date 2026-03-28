import { Router } from "express";
import subscriptionPlanController from "./subscriptionPlan.controller";

const router = Router();

router.post("/create", subscriptionPlanController.createNewSubscriptionPlan);

const subscriptionPlanRouter = router;
export default subscriptionPlanRouter;
