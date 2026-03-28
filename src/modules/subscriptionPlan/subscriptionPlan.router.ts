import { Router } from "express";
import subscriptionPlanController from "./subscriptionPlan.controller";

const router = Router();

router.post("/create", subscriptionPlanController.createNewSubscriptionPlan);

router.get("/", subscriptionPlanController.getAllSubscriptionPlans);

router.get(
  "/:subscriptionPlanId",
  subscriptionPlanController.getSingleSubscriptionPlan,
);

router.put(
  "/update/:subscriptionPlanId",
  subscriptionPlanController.updateSubscriptionPlan,
);

const subscriptionPlanRouter = router;
export default subscriptionPlanRouter;
