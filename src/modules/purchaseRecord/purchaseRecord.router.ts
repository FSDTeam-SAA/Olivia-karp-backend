import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { purchaseRecordController } from "./purchaseRecord.controller";

const router = Router();

router.get(
  "/my-purchases",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseRecordController.getMyPurchases,
);

router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  purchaseRecordController.getAllPurchases,
);

export const purchaseRecordRoutes = router;
