import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import parseData from "../../middleware/parseData";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { educationPartnerController } from "./educationPartner.controller";
import { EducationPartnerValidations } from "./educationPartner.validation";

/**
 * @swagger
 * tags:
 *   name: Education Partner Program
 *   description: Endpoints for Education Partners, course listings, reviews, direct referrals, and program info
 */

const router = Router();

// ==========================================
// 1. Public Information & Directory
// ==========================================

/**
 * @swagger
 * /api/v1/education-partner/info:
 *   get:
 *     summary: Retrieve landing page information, pricing, benefits, and FAQs for the Education Partnership Program
 *     tags: [Education Partner Program]
 *     responses:
 *       200:
 *         description: Program info retrieved successfully
 */
router.get("/info", educationPartnerController.getProgramInfo);

/**
 * @swagger
 * /api/v1/education-partner/public/partners:
 *   get:
 *     summary: Browse verified Education Partners directory with search and filtering
 *     tags: [Education Partner Program]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search partner by organization name or expertise
 *       - in: query
 *         name: organizationType
 *         schema:
 *           type: string
 *           enum: [university, college, nonprofit, ngo, professional_education, training_organization, industry_association, company, independent_educator, other]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by climate category or expertise
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
 *     responses:
 *       200:
 *         description: List of verified Education Partners
 */
router.get("/public/partners", educationPartnerController.getAllPublicPartners);

/**
 * @swagger
 * /api/v1/education-partner/public/partners/{slug}:
 *   get:
 *     summary: Get public profile and published courses of an Education Partner
 *     tags: [Education Partner Program]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner organization slug
 *     responses:
 *       200:
 *         description: Partner public profile and approved courses
 *       404:
 *         description: Partner not found
 */
router.get(
  "/public/partners/:slug",
  educationPartnerController.getPublicPartnerBySlug
);

/**
 * @swagger
 * /api/v1/education-partner/public/courses:
 *   get:
 *     summary: Search and filter published climate courses across all Education Partners
 *     tags: [Education Partner Program]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword search in title, summary, outcomes, and audience
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Climate topic category (e.g., Climate Finance, Renewable Energy, ESG)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [online_self_paced, online_cohort, in_person, hybrid, workshop, short_course, certificate_program]
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: boolean
 *         description: Filter free courses
 *       - in: query
 *         name: hasCertificate
 *         schema:
 *           type: boolean
 *         description: Filter courses offering certificates
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [featured, popular, price_asc, price_desc]
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
 *     responses:
 *       200:
 *         description: List of approved courses
 */
router.get("/public/courses", educationPartnerController.getAllPublicCourses);

/**
 * @swagger
 * /api/v1/education-partner/public/courses/{slug}:
 *   get:
 *     summary: View single course details and increment view count
 *     tags: [Education Partner Program]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details with partner profile badge
 *       404:
 *         description: Course not found
 */
router.get(
  "/public/courses/:slug",
  educationPartnerController.getPublicCourseBySlug
);

/**
 * @swagger
 * /api/v1/education-partner/courses/{id}/track-click:
 *   post:
 *     summary: Record outbound click to partner enrollment link and return target URL
 *     tags: [Education Partner Program]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Outbound click logged
 */
router.post(
  "/courses/:id/track-click",
  educationPartnerController.trackCourseOutboundClick
);

// ==========================================
// 2. Partner Authenticated Portal
// ==========================================

/**
 * @swagger
 * /api/v1/education-partner/survey:
 *   post:
 *     summary: Submit or update Education Partner onboarding survey and profile
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *                 description: JSON encoded survey body
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Partner survey and profile saved
 */
router.post(
  "/survey",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  parseData,
  validateRequest(EducationPartnerValidations.createPartnerSurveySchema),
  educationPartnerController.submitSurvey
);

/**
 * @swagger
 * /api/v1/education-partner/me:
 *   get:
 *     summary: Get logged-in partner's profile and membership status
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged in partner profile
 */
router.get(
  "/me",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.getMyProfile
);

/**
 * @swagger
 * /api/v1/education-partner/me:
 *   put:
 *     summary: Update logged-in partner's organization details
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner profile updated
 */
router.put(
  "/me",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  parseData,
  validateRequest(EducationPartnerValidations.updatePartnerProfileSchema),
  educationPartnerController.updateMyProfile
);

/**
 * @swagger
 * /api/v1/education-partner/membership/checkout:
 *   post:
 *     summary: Initiate Stripe checkout for $50/year annual Education Partner membership
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               successUrl:
 *                 type: string
 *               cancelUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stripe checkout session URL created
 */
router.post(
  "/membership/checkout",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  validateRequest(EducationPartnerValidations.checkoutMembershipSchema),
  educationPartnerController.createMembershipCheckout
);

/**
 * @swagger
 * /api/v1/education-partner/stripe-connect/onboard:
 *   post:
 *     summary: Generate Stripe Connect onboarding link for education partner payout setup
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnUrl:
 *                 type: string
 *               refreshUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stripe Connect onboarding URL returned
 */
router.post(
  "/stripe-connect/onboard",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  validateRequest(EducationPartnerValidations.stripeConnectOnboardSchema),
  educationPartnerController.createStripeConnectOnboard
);

/**
 * @swagger
 * /api/v1/education-partner/stripe-connect/status:
 *   get:
 *     summary: Retrieve real-time Stripe Connect connection and payout status
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stripe Connect account status
 */
router.get(
  "/stripe-connect/status",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.getStripeConnectStatus
);

/**
 * @swagger
 * /api/v1/education-partner/stripe-connect/dashboard-link:
 *   get:
 *     summary: Get single-sign-on link to partner's Stripe Express payout dashboard
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Express dashboard login URL
 */
router.get(
  "/stripe-connect/dashboard-link",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.createStripeConnectDashboardLink
);

/**
 * @swagger
 * /api/v1/education-partner/courses:
 *   post:
 *     summary: Submit a new climate course/workshop for review
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *                 description: JSON encoded course details
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Course submitted for review
 */
router.post(
  "/courses",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  upload.single("coverImage"),
  parseData,
  validateRequest(EducationPartnerValidations.createPartnerCourseSchema),
  educationPartnerController.submitCourse
);

/**
 * @swagger
 * /api/v1/education-partner/courses/my-courses:
 *   get:
 *     summary: List all courses submitted by logged-in partner with status
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner's course list
 */
router.get(
  "/courses/my-courses",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.getMyCourses
);

/**
 * @swagger
 * /api/v1/education-partner/courses/{id}:
 *   get:
 *     summary: Get single course details (for partner editing or admin review)
 *     tags: [Education Partner Program]
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
 *         description: Course details
 */
router.get(
  "/courses/:id",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.getCourseById
);

/**
 * @swagger
 * /api/v1/education-partner/courses/{id}:
 *   put:
 *     summary: Update course details or resubmit after revisions
 *     tags: [Education Partner Program]
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
 *         description: Course updated
 */
router.put(
  "/courses/:id",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  upload.single("coverImage"),
  parseData,
  validateRequest(EducationPartnerValidations.updatePartnerCourseSchema),
  educationPartnerController.updateCourse
);

/**
 * @swagger
 * /api/v1/education-partner/courses/{id}:
 *   delete:
 *     summary: Delete a course listing
 *     tags: [Education Partner Program]
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
 *         description: Course deleted
 */
router.delete(
  "/courses/:id",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.deleteCourse
);

/**
 * @swagger
 * /api/v1/education-partner/analytics:
 *   get:
 *     summary: Get partner course engagement, view counts, and outbound click analytics
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner engagement insights
 */
router.get(
  "/analytics",
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NON_MEMBER,
    USER_ROLE.MEMBER,
    USER_ROLE.ANNUAL_MEMBER,
    USER_ROLE.MONTHLY_MEMBER,
    USER_ROLE.BEGINNER_MEMBER
  ),
  educationPartnerController.getPartnerAnalytics
);

// ==========================================
// 3. Admin Moderation & Management
// ==========================================

/**
 * @swagger
 * /api/v1/education-partner/admin/courses/review-queue:
 *   get:
 *     summary: View submitted and under-review courses (Admin Only)
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review queue
 */
router.get(
  "/admin/courses/review-queue",
  auth(USER_ROLE.ADMIN),
  educationPartnerController.getAdminReviewQueue
);

/**
 * @swagger
 * /api/v1/education-partner/admin/courses/{id}/review:
 *   patch:
 *     summary: Approve, reject, or request revision on a course (Admin Only)
 *     tags: [Education Partner Program]
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
 *         description: Course review updated
 */
router.patch(
  "/admin/courses/:id/review",
  auth(USER_ROLE.ADMIN),
  validateRequest(EducationPartnerValidations.reviewCourseSchema),
  educationPartnerController.adminReviewCourse
);

/**
 * @swagger
 * /api/v1/education-partner/admin/partners:
 *   get:
 *     summary: Manage all education partner organizations (Admin Only)
 *     tags: [Education Partner Program]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of partners
 */
router.get(
  "/admin/partners",
  auth(USER_ROLE.ADMIN),
  educationPartnerController.getAllPartnersAdmin
);

/**
 * @swagger
 * /api/v1/education-partner/admin/partners/{id}/status:
 *   patch:
 *     summary: Update partner membership status or verification (Admin Only)
 *     tags: [Education Partner Program]
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
 *         description: Partner status updated
 */
router.patch(
  "/admin/partners/:id/status",
  auth(USER_ROLE.ADMIN),
  educationPartnerController.adminUpdatePartnerStatus
);

/**
 * @swagger
 * /api/v1/education-partner/admin/partners/{id}/activate:
 *   post:
 *     summary: Manually activate partner annual membership and trigger activation email (Admin Only)
 *     tags: [Education Partner Program]
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
 *         description: Partner membership activated
 */
router.post(
  "/admin/partners/:id/activate",
  auth(USER_ROLE.ADMIN),
  educationPartnerController.adminActivateMembership
);

export const EducationPartnerRoutes = router;
