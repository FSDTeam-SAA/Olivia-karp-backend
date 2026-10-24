import { Router } from "express";
import auth from "../../middleware/auth";
import { RecommendationController } from "./recommendation.controller";

const router = Router();

router.get(
  "/my-recommendations",
  auth(),
  RecommendationController.getMyRecommendations,
);

export const RecommendationRoutes = router;

