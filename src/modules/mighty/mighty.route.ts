import { Router } from "express";
import { mightyController } from "./mighty.controller";

const router = Router();

// This endpoint will be hit by Zapier
router.post(
  "/webhook",
  mightyController.mightyWebhookHandler
);


// Endpoint for Custom Site to show plans
router.get("/plans", mightyController.getPlans);

export const mightyRoutes = router;