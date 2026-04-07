import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { getAllNotifications, markAllAsRead } from "./notification.controller";

const router = Router();

router.get("/", auth(USER_ROLE.ADMIN), getAllNotifications);
router.patch("/read/all", markAllAsRead);

const notificationRouter = router;
export default notificationRouter;
