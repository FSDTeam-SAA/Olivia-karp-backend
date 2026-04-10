import express from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { opportunityController } from "./opportunity.controller";

/**
 * @swagger
 * tags:
 *   name: Opportunity
 *   description: Managing community-submitted opportunities and admin review processes
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/opportunity/submit:
 *   post:
 *     summary: Submit a new opportunity (Member/Non-Member)
 *     tags: [Opportunity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - organizationName
 *               - opportunityType
 *               - location
 *               - officialLink
 *               - shortDescription
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Full Stack Developer Intern"
 *               organizationName:
 *                 type: string
 *                 example: "Tech Innovators Inc"
 *               opportunityType:
 *                 type: string
 *                 example: "Internship"
 *               location:
 *                 type: string
 *                 example: "Remote / New York"
 *               officialLink:
 *                 type: string
 *                 format: uri
 *                 example: "https://company.com/careers/apply"
 *               shortDescription:
 *                 type: string
 *                 maxLength: 300
 *                 example: "A 3-month internship for aspiring developers."
 *     responses:
 *       201:
 *         description: Opportunity submitted successfully for review
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/submit",
    auth(USER_ROLE.MEMBER, USER_ROLE.NON_MEMBER),
    opportunityController.submitOpportunity
);

/**
 * @swagger
 * /api/v1/opportunity/all:
 *   get:
 *     summary: Retrieve all submitted opportunities (Admin Only)
 *     tags: [Opportunity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of opportunities retrieved successfully
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
    "/all",
    auth(USER_ROLE.ADMIN),
    opportunityController.getOpportunities
);

/**
 * @swagger
 * /api/v1/opportunity/review/{id}:
 *   patch:
 *     summary: Update opportunity status (Admin Only)
 *     tags: [Opportunity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The opportunity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, rejected]
 *                 example: "reviewed"
 *     responses:
 *       200:
 *         description: Opportunity status updated successfully
 *       404:
 *         description: Opportunity not found
 */
router.patch(
    "/review/:id",
    auth(USER_ROLE.ADMIN),
    opportunityController.reviewOpportunity
);

export const OpportunityRoutes = router;