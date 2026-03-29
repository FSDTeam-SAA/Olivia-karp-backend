import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import paymentController from "./payment.controller";

const router = Router();

router.post(
  "/purchase",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  paymentController.createPaymentForSubscription,
);
router.post("/webhook", paymentController.stripeWebhookHandler);

const paymentRouter = router;
export default paymentRouter;
