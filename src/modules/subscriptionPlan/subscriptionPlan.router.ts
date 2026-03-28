import { Router } from "express";
import subscriptionPlanController from "./subscriptionPlan.controller";

const router = Router();

router.post("/create", subscriptionPlanController.createNewSubscriptionPlan);

router.get("/", subscriptionPlanController.getAllSubscriptionPlans);

const subscriptionPlanRouter = router;
export default subscriptionPlanRouter;
