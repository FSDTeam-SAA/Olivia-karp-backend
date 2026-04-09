import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { purchaseRecordController } from "./purchaseRecord.controller";

/**
 * @swagger
 * tags:
 *   name: PurchaseRecord
 *   description: Tracking individual item purchases (Courses, Events, Career Services) excluding main subscriptions
 */

const router = Router();

/**
 * @swagger
 * /api/v1/purchaseRecord/my-purchases:
 *   get:
 *     summary: Retrieve my item purchase history
 *     tags: [PurchaseRecord]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of personal purchases retrieved
 */
router.get(
  "/my-purchases",
  auth(USER_ROLE.NON_MEMBER, USER_ROLE.MEMBER),
  purchaseRecordController.getMyPurchases,
);

/**
 * @swagger
 * /api/v1/purchaseRecord/all:
 *   get:
 *     summary: Retrieve all item purchase records (Admin Only)
 *     tags: [PurchaseRecord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, unpaid, free]
 *       - in: query
 *         name: itemType
 *         schema:
 *           type: string
 *           enum: [course, event, careerService]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of all purchase records
 */
router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  purchaseRecordController.getAllPurchases,
);

export const purchaseRecordRoutes = router;

