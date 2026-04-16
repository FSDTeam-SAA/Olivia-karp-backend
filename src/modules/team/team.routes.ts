import { Router } from "express";
import auth from "../../middleware/auth";
import optionalAuth from "../../middleware/optionalAuth";
import { upload } from "../../middleware/multer.middleware";
import { USER_ROLE } from "../user/user.constant";
import teamController from "./team.controller";

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team members and their profile management API
 */
const router = Router();

/**
 * @swagger
 * /api/v1/team/create:
 *   post:
 *     summary: Create a new team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designation
 *               - description
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Team member's profile image
 *               name:
 *                 type: string
 *                 description: Full name of the team member
 *               designation:
 *                 type: string
 *                 description: Job title or designation
 *               description:
 *                 type: string
 *                 description: Bio or description
 *               linkedIn:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               twitter:
 *                 type: string
 *               x:
 *                 type: string
 *               youtube:
 *                 type: string
 *               website:
 *                 type: string
 *               socialLinks:
 *                 type: string
 *                 description: JSON string of social links array (fallback/advanced). Example '[{"platform":"linkedin","url":"https..."}]'

 *     responses:
 *       201:
 *         description: Team member created successfully
 */
router.post(
  "/create",
  auth(USER_ROLE.ADMIN),
  upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  teamController.createNewTeamMember,
);

/**
 * @swagger
 * /api/v1/team/all:
 *   get:
 *     summary: Retrieve all team members with pagination and search
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by name or designation
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
 *       - in: query
 *         name: sort
 *         style: deepObject
 *         schema:
 *           type: object
 *         description: Sort options, e.g. sort[createdAt]=-1
 *     responses:
 *       200:
 *         description: List of team members
 */
router.get("/all", optionalAuth(), teamController.getAllTeamMembers);

/**
 * @swagger
 * /api/v1/team/{id}:
 *   get:
 *     summary: Get a single team member by ID
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member details
 *       404:
 *         description: Team member not found
 */
router.get("/:id", optionalAuth(), teamController.getSingleTeamMember);

/**
 * @swagger
 * /api/v1/team/{id}:
 *   put:
 *     summary: Update an existing team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               description:
 *                 type: string
 *               linkedIn:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               twitter:
 *                 type: string
 *               x:
 *                 type: string
 *               youtube:
 *                 type: string
 *               website:
 *                 type: string
 *               socialLinks:
 *                 type: string
 *                 description: JSON string of social links array (fallback).

 *     responses:
 *       200:
 *         description: Team member updated successfully
 *       404:
 *         description: Team member not found
 */
router.put(
  "/:id",
  auth(USER_ROLE.ADMIN),
  upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  teamController.updateTeamMember,
);

/**
 * @swagger
 * /api/v1/team/{id}:
 *   delete:
 *     summary: Delete a team member
 *     tags: [Team]
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
 *         description: Team member deleted successfully
 *       404:
 *         description: Team member not found
 */
router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN),
  teamController.deleteTeamMember,
);

const teamRoutes = router;
export default teamRoutes;
