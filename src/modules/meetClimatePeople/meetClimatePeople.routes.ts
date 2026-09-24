import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import validateMightyWebhook from "../../middleware/validateMightyWebhook";
import { meetClimatePeopleController } from "./meetClimatePeople.controller";

/**
 * @swagger
 * tags:
 *   name: Meet Climate People
 *   description: Member directory showcasing climate professionals synced from Mighty Networks
 */

const router = Router();

/**
 * @swagger
 * /api/v1/meet-climate-people:
 *   get:
 *     summary: Retrieve climate talent profiles with filtering and search
 *     tags: [Meet Climate People]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, title, organization, skills, or interests
 *       - in: query
 *         name: climateInterest
 *         schema:
 *           type: string
 *         description: Filter by climate interest tag (e.g. Renewable Energy, Wildfires)
 *       - in: query
 *         name: professionalArea
 *         schema:
 *           type: string
 *         description: Filter by professional focus area
 *       - in: query
 *         name: lookingFor
 *         schema:
 *           type: string
 *         description: Filter by what member is looking for (e.g. Mentorship, Collaboration)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Profiles per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of climate profiles retrieved successfully
 */
router.get("/", meetClimatePeopleController.getAllProfiles);

/**
 * @swagger
 * /api/v1/meet-climate-people/sync/status:
 *   get:
 *     summary: Get directory sync telemetry and profile counts (Admin Only)
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync telemetry retrieved successfully
 */
router.get("/sync/status", auth(USER_ROLE.ADMIN), meetClimatePeopleController.getSyncStatus);

/**
 * @swagger
 * /api/v1/meet-climate-people/sync:
 *   post:
 *     summary: Trigger manual synchronization from Mighty Networks API (Admin Only)
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Directory synchronization completed successfully
 */
router.post("/sync", auth(USER_ROLE.ADMIN), meetClimatePeopleController.syncProfiles);

/**
 * @swagger
 * /api/v1/meet-climate-people/webhook:
 *   post:
 *     summary: Inbound webhook receiver for Mighty Networks member events
 *     tags: [Meet Climate People]
 *     responses:
 *       200:
 *         description: Webhook received and processed
 */
router.post("/webhook", validateMightyWebhook(), meetClimatePeopleController.handleWebhook);

/**
 * @swagger
 * /api/v1/meet-climate-people/{id}/visibility:
 *   patch:
 *     summary: Toggle profile visibility in public directory (Admin Only)
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB ID or Mighty Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVisible
 *             properties:
 *               isVisible:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Profile visibility status updated successfully
 */
router.patch("/:id/visibility", auth(USER_ROLE.ADMIN), meetClimatePeopleController.updateProfileVisibility);

/**
 * @swagger
 * /api/v1/meet-climate-people/{id}:
 *   get:
 *     summary: Get details of a single climate profile
 *     tags: [Meet Climate People]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB ID or Mighty Member ID
 *     responses:
 *       200:
 *         description: Single climate profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get("/:id", meetClimatePeopleController.getProfileById);

export const meetClimatePeopleRoutes = router;
