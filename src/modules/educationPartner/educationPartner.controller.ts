import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { educationPartnerService } from "./educationPartner.service";

// ==========================================
// 1. Landing Page Information
// ==========================================
const getProgramInfo = catchAsync(async (_req: Request, res: Response) => {
  const result = await educationPartnerService.getProgramInfo();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education Partnership Program information retrieved successfully",
    data: result,
  });
});

// ==========================================
// 2. Survey & Partner Profile
// ==========================================
const submitSurvey = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const result = await educationPartnerService.createOrUpdateSurvey(
    userId,
    req.body,
    files
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education Partner survey submitted successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.getMyPartnerProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const result = await educationPartnerService.updateMyPartnerProfile(
    userId,
    req.body,
    files
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner profile updated successfully",
    data: result,
  });
});

// ==========================================
// 3. Membership Checkout ($50/year)
// ==========================================
const createMembershipCheckout = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.createMembershipCheckoutSession(
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Membership checkout session created successfully",
    data: result,
  });
});

const createStripeConnectOnboard = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.createStripeConnectOnboardingLink(
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe Connect onboarding link created successfully",
    data: result,
  });
});

const getStripeConnectStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.getStripeConnectStatus(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe Connect status retrieved successfully",
    data: result,
  });
});

const createStripeConnectDashboardLink = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.createStripeConnectDashboardLink(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe Connect login link created successfully",
    data: result,
  });
});

// ==========================================
// 4. Course Submissions & Management
// ==========================================
const submitCourse = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const file = req.file;

  const result = await educationPartnerService.submitCourse(
    userId,
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course submitted successfully for review",
    data: result,
  });
});

const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.getMyCourses(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner courses retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const { id } = req.params;
  const result = await educationPartnerService.getCourseById(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details retrieved successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const { id } = req.params;
  const file = req.file;

  const result = await educationPartnerService.updateCourse(
    userId,
    id,
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course updated successfully",
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const { id } = req.params;
  const result = await educationPartnerService.deleteCourse(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course deleted successfully",
    data: result,
  });
});

// ==========================================
// 5. Partner Analytics
// ==========================================
const getPartnerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await educationPartnerService.getPartnerAnalytics(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner engagement analytics retrieved successfully",
    data: result,
  });
});

// ==========================================
// 6. Public Directory & Courses
// ==========================================
const getAllPublicPartners = catchAsync(async (req: Request, res: Response) => {
  const result = await educationPartnerService.getAllPublicPartners(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education partners retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPublicPartnerBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await educationPartnerService.getPublicPartnerBySlug(slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education partner profile retrieved successfully",
    data: result,
  });
});

const getAllPublicCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await educationPartnerService.getAllPublicCourses(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Public climate courses retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPublicCourseBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await educationPartnerService.getPublicCourseBySlug(slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details retrieved successfully",
    data: result,
  });
});

const trackCourseOutboundClick = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any)?._id;
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString();
  const userAgent = req.headers["user-agent"];
  const referrer = req.headers["referer"];

  const result = await educationPartnerService.trackCourseOutboundClick(id, {
    userId,
    ip,
    userAgent,
    referrer,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Outbound click logged successfully",
    data: result,
  });
});

// ==========================================
// 7. Admin Moderation & Management
// ==========================================
const getAdminReviewQueue = catchAsync(async (req: Request, res: Response) => {
  const result = await educationPartnerService.getAdminReviewQueue(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course review queue retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const adminReviewCourse = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as any)._id;
  const { id } = req.params;

  const result = await educationPartnerService.adminReviewCourse(
    adminId,
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course status updated to ${req.body.status}`,
    data: result,
  });
});

const getAllPartnersAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await educationPartnerService.getAllPartnersAdmin(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partners retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const adminUpdatePartnerStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await educationPartnerService.adminUpdatePartnerStatus(
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner status updated successfully",
    data: result,
  });
});

const adminActivateMembership = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await educationPartnerService.activatePartnerMembership(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Partner membership activated successfully and welcome email sent",
    data: result,
  });
});

export const educationPartnerController = {
  getProgramInfo,
  submitSurvey,
  getMyProfile,
  updateMyProfile,
  createMembershipCheckout,
  createStripeConnectOnboard,
  getStripeConnectStatus,
  createStripeConnectDashboardLink,
  submitCourse,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getPartnerAnalytics,
  getAllPublicPartners,
  getPublicPartnerBySlug,
  getAllPublicCourses,
  getPublicCourseBySlug,
  trackCourseOutboundClick,
  getAdminReviewQueue,
  adminReviewCourse,
  getAllPartnersAdmin,
  adminUpdatePartnerStatus,
  adminActivateMembership,
};
