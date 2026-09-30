import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import parseData from "../../middleware/parseData";
import validateRequest from "../../middleware/validateRequest";
import validateMightyWebhook from "../../middleware/validateMightyWebhook";
import { USER_ROLE } from "../user/user.constant";
import { meetClimatePeopleController } from "./meetClimatePeople.controller";
import { MeetClimatePeopleValidation } from "./meetClimatePeople.validation";

/**
 * @swagger
 * tags:
 *   name: Meet Climate People
 *   description: Member directory showcasing climate professionals, self-service member profiles, and Mighty Networks synchronization
 */

const router = Router();

const ALL_MEMBER_ROLES = [
  USER_ROLE.ADMIN,
  USER_ROLE.MEMBER,
  USER_ROLE.NON_MEMBER,
  USER_ROLE.ANNUAL_MEMBER,
  USER_ROLE.MONTHLY_MEMBER,
  USER_ROLE.BEGINNER_MEMBER,
];

// =========================================================================
// 1. Member Self-Service Profile Endpoints (Must be before /:id)
// =========================================================================

/**
 * @swagger
 * /api/v1/meet-climate-people/me:
 *   get:
 *     summary: Get logged-in user's climate profile
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details returned (or null if not yet created)
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth(...ALL_MEMBER_ROLES), meetClimatePeopleController.getMyProfile);

/**
 * @swagger
 * /api/v1/meet-climate-people/me:
 *   post:
 *     summary: Create or update logged-in user's climate profile (Supports JSON or Multipart Form-Data)
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *                 description: JSON-stringified profile details
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               professionalTitle:
 *                 type: string
 *                 example: "Climate Tech Product Manager"
 *               organization:
 *                 type: string
 *                 example: "CleanEnergy Ventures"
 *               about:
 *                 type: string
 *                 example: "Passionate about scaling carbon removal tech and sustainable supply chains."
 *               professionalAreas:
 *                 type: array
 *                 items: { type: string }
 *                 description: "I am: Climate-curious, Student, Professional, Career Changer, Entrepreneur, Educator, Researcher"
 *                 example: ["Professional", "Entrepreneur"]
 *               climateInterests:
 *                 type: array
 *                 items: { type: string }
 *                 description: "I'm interested in: Climate Tech, Energy, Policy, Finance, Sustainability, Climate Careers, Biodiversity, Sustainable Business"
 *                 example: ["Climate Tech", "Energy", "Sustainability"]
 *               lookingFor:
 *                 type: array
 *                 items: { type: string }
 *                 description: "I'm looking for: Mentorship, Jobs, Networking, Collaborators, Career Advice, Learning, Business Connections"
 *                 example: ["Mentorship", "Collaborators", "Jobs"]
 *               canHelpWith:
 *                 type: array
 *                 items: { type: string }
 *                 description: "I can help with: Marketing, Engineering, Policy, Finance, Research, Communications, Technology, Sustainability"
 *                 example: ["Technology", "Sustainability", "Marketing"]
 *               skills:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Product Strategy", "Carbon Accounting", "Renewables"]
 *               areasOfExpertise:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Energy Transition", "Climate SaaS"]
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     school: { type: string }
 *                     degree: { type: string }
 *                     year: { type: string }
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     company: { type: string }
 *                     duration: { type: string }
 *               linkedin:
 *                 type: string
 *                 example: "https://linkedin.com/in/janedoe"
 *               website:
 *                 type: string
 *                 example: "https://janedoe.com"
 *               portfolio:
 *                 type: string
 *               location:
 *                 type: string
 *                 example: "Toronto, Canada"
 *               isVisible:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Profile created or updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/me",
  auth(...ALL_MEMBER_ROLES),
  upload.single("profileImage"),
  parseData,
  validateRequest(MeetClimatePeopleValidation.createOrUpdateMyProfileSchema),
  meetClimatePeopleController.createOrUpdateMyProfile
);

/**
 * @swagger
 * /api/v1/meet-climate-people/me:
 *   put:
 *     summary: Update logged-in user's climate profile
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
  "/me",
  auth(...ALL_MEMBER_ROLES),
  upload.single("profileImage"),
  parseData,
  validateRequest(MeetClimatePeopleValidation.createOrUpdateMyProfileSchema),
  meetClimatePeopleController.createOrUpdateMyProfile
);

/**
 * @swagger
 * /api/v1/meet-climate-people/me:
 *   delete:
 *     summary: Delete logged-in user's climate profile
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 */
router.delete("/me", auth(...ALL_MEMBER_ROLES), meetClimatePeopleController.deleteMyProfile);

// =========================================================================
// 2. Public Directory Endpoints
// =========================================================================

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
 *         description: Filter by climate interest tag (e.g. Climate Tech, Renewable Energy)
 *       - in: query
 *         name: professionalArea
 *         schema:
 *           type: string
 *         description: Filter by professional focus area (e.g. Professional, Entrepreneur, Student)
 *       - in: query
 *         name: lookingFor
 *         schema:
 *           type: string
 *         description: Filter by what member is looking for (e.g. Mentorship, Jobs, Collaboration)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of climate profiles retrieved successfully
 */
router.get("/", meetClimatePeopleController.getAllProfiles);

// =========================================================================
// 3. Admin & Integration Endpoints
// =========================================================================

/**
 * @swagger
 * /api/v1/meet-climate-people/admin/create:
 *   post:
 *     summary: Create a climate profile manually (Admin Only)
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Profile created successfully by admin
 */
router.post(
  "/admin/create",
  auth(USER_ROLE.ADMIN),
  upload.single("profileImage"),
  parseData,
  validateRequest(MeetClimatePeopleValidation.adminCreateProfileSchema),
  meetClimatePeopleController.adminCreateProfile
);

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
router.patch(
  "/:id/visibility",
  auth(USER_ROLE.ADMIN),
  validateRequest(MeetClimatePeopleValidation.updateProfileVisibilitySchema),
  meetClimatePeopleController.updateProfileVisibility
);

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

/**
 * @swagger
 * /api/v1/meet-climate-people/{id}:
 *   delete:
 *     summary: Delete a profile by ID (Admin Only)
 *     tags: [Meet Climate People]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 */
router.delete("/:id", auth(USER_ROLE.ADMIN), meetClimatePeopleController.deleteProfileById);

export const meetClimatePeopleRoutes = router;
