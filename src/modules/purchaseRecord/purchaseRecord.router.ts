import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { purchaseRecordController } from "./purchaseRecord.controller";

/**
 * @swagger
 * tags:
 *   name: PurchaseRecord
 *   description: API operations for PurchaseRecord
 */


const router = Router();


/**
 * @swagger
 * /api/v1/purchaseRecord/my-purchases:
 *   get:
 *     summary: GET endpoint for purchaseRecord
 *     tags: [PurchaseRecord]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *     summary: GET endpoint for purchaseRecord
 *     tags: [PurchaseRecord]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/all",
  auth(USER_ROLE.ADMIN),
  purchaseRecordController.getAllPurchases,
);

export const purchaseRecordRoutes = router;
