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
router.get("/all", auth(USER_ROLE.ADMIN), paymentController.getAllPayment);

router.get(
  "/:paymentId",
  //   auth(USER_ROLE.ADMIN),
  paymentController.getSinglePayment,
);

const paymentRouter = router;
export default paymentRouter;
