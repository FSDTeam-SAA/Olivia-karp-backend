import { Router } from "express";
import { contactController } from "./contact.controller";

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Handling direct inquiries and messages from the contact form
 */

const router = Router();

/**
 * @swagger
 * /api/v1/contact/send-message:
 *   post:
 *     summary: Send a message via the contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - message
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post("/send-message", contactController.sendContact);

const contactRouter = router;
export default contactRouter;

