import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import purchaseSubscriptionController from "./purchaseSubscription.controller";

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseSubscriptionController.createPurchaseSubscription,
);

const purchaseSubscriptionRouter = router;
export default purchaseSubscriptionRouter;
