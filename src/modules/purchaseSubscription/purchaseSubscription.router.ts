import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import purchaseSubscriptionController from "./purchaseSubscription.controller";

const router = Router();

// 🔹 Get current user's active benefits (access levels + discounts)
router.get(
  "/my-benefits",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.getUserBenefits,
);

// 🔹 Get current user's subscription history
router.get(
  "/me",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.getMySubscription,
);

// 🔹 Admin: Get all subscriptions (paginated)
router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  purchaseSubscriptionController.getAllSubscriptions,
);

const purchaseSubscriptionRouter = router;
export default purchaseSubscriptionRouter;
