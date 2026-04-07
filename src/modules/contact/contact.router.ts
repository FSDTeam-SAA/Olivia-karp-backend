import { Router } from "express";
import { contactController } from "./contact.controller";

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: API operations for Contact
 */


const router = Router();


/**
 * @swagger
 * /api/v1/contact/send-message:
 *   post:
 *     summary: POST endpoint for contact
 *     tags: [Contact]
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
router.post("/send-message", contactController.sendContact);

const contactRouter = router;
export default contactRouter;
