import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Stripe from "stripe";
import config from "../../config";
import AppError from "../../errors/AppError";
import logger from "../../logger";
import { uploadToCloudinary } from "../../utils/cloudinary";
import sendEmail from "../../utils/sendEmail";
import Course from "../course/course.model";
import { User } from "../user/user.model";
import {
  CourseClick,
  PartnerCourse,
  PartnerProfile,
} from "./educationPartner.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Helper to generate URL-safe unique slugs
const generateSlug = async (
  baseName: string,
  model: any,
  existingId?: Types.ObjectId
): Promise<string> => {
  const baseSlug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug || "item";
  let count = 0;

  while (true) {
    const candidate = count === 0 ? slug : `${slug}-${count}`;
    const query: any = { slug: candidate };
    if (existingId) {
      query._id = { $ne: existingId };
    }
    const exists = await model.findOne(query);
    if (!exists) {
      return candidate;
    }
    count++;
  }
};

// ==========================================
// 1. Program Landing Page Information
// ==========================================
const getProgramInfo = async () => {
  return {
    title: "Act on Climate Education Partnership Program",
    tagline: "Put your climate education in front of people looking to learn",
    subtagline: "Help more people discover your climate and sustainability education.",
    summary:
      "Join the Act on Climate Education Partnership Program and showcase your courses, certificates, workshops and training programs to people looking to build their climate and sustainability knowledge.",
    pricing: {
      annualFee: 50,
      currency: "USD",
      commissionRate: "0%",
      revenueShare: "100% yours",
      terms: "No referral fees. No transaction fees. No percentage of your course sales. Free courses are welcome.",
    },
    supportedCategories: [
      "Climate Science",
      "Climate Policy",
      "Climate Finance",
      "Renewable Energy",
      "Sustainability",
      "ESG",
      "Climate Risk",
      "Biodiversity & Nature",
      "Green Buildings",
      "Sustainable Business",
      "Food & Agriculture",
      "Climate Careers",
      "Climate Leadership",
    ],
    whoIsItFor: [
      "Universities and colleges",
      "Nonprofits and NGOs",
      "Professional education providers",
      "Training organizations",
      "Industry associations",
      "Companies offering climate or sustainability training",
      "Independent educators and instructors",
      "Organizations offering certificates or professional development",
      "Organizations offering workshops, short courses or other educational programs",
    ],
    membershipBenefits: [
      {
        icon: "📚",
        title: "List your courses",
        description:
          "Showcase your climate, sustainability, energy or environmental courses, certificates, workshops and training programs on Act on Climate.",
      },
      {
        icon: "🌎",
        title: "Reach a climate-focused audience",
        description:
          "Give people who are actively looking for climate and sustainability education another way to discover your programs.",
      },
      {
        icon: "🔗",
        title: "Connect learners directly to you",
        description:
          "Each course listing can link directly to your website, registration page or enrollment platform. Act on Climate does not process learner payments.",
      },
      {
        icon: "🏢",
        title: "Create your Education Partner profile",
        description:
          "Tell learners about your organization, expertise, educational offerings and the people behind your programs.",
      },
      {
        icon: "✓",
        title: "Receive Education Partner recognition",
        description:
          "Receive an Act on Climate Education Partner designation badge on your organization and eligible course listings.",
      },
      {
        icon: "📣",
        title: "Opportunities for greater visibility",
        description:
          "Eligible Education Partners may be considered for featured courses, collections, newsletters and other promotional opportunities.",
      },
      {
        icon: "📊",
        title: "Course engagement insights",
        description:
          "Access real-time information about how learners are discovering and clicking through to your courses.",
      },
      {
        icon: "🤝",
        title: "Join a growing education network",
        description:
          "Become part of a network of organizations and educators working to build climate and sustainability knowledge.",
      },
    ],
    howItWorksSteps: [
      {
        step: 1,
        title: "Create your Act on Climate account",
        description:
          "Select 'I provide climate education' during signup to access partner onboarding.",
      },
      {
        step: 2,
        title: "Tell us about your organization",
        description:
          "Complete a short Education Partner survey with details on your organization, offerings, and expertise.",
      },
      {
        step: 3,
        title: "Join the Education Partner Program",
        description:
          "Complete your $50/year membership with 0% commission on course sales.",
      },
      {
        step: 4,
        title: "Activate your membership",
        description:
          "Receive your welcome email with direct access to the course submission form.",
      },
      {
        step: 5,
        title: "Submit your course",
        description:
          "Provide course details, outcomes, format, pricing, prerequisites, and direct enrollment URL.",
      },
      {
        step: 6,
        title: "We review your course",
        description:
          "Courses are reviewed for climate relevance, credibility, clear outcomes, and transparent pricing.",
      },
      {
        step: 7,
        title: "Your course goes live",
        description:
          "Once approved, your course receives a dedicated listing with verified partner badge and direct link.",
      },
      {
        step: 8,
        title: "Learners discover your course",
        description:
          "Learners discover your programs and register directly on your platform. You keep 100% of your revenue.",
      },
    ],
    faqs: [
      {
        question: "Is the $50 fee a one-time payment?",
        answer: "No. Education Partner membership is $50 per year.",
      },
      {
        question: "Does Act on Climate take a percentage of my course sales?",
        answer: "No. Act on Climate takes 0% commission. You keep 100% of the revenue from your courses.",
      },
      {
        question: "Does Act on Climate process course payments?",
        answer: "No. Learners are directed to your website, registration page or enrollment platform to register and pay.",
      },
      {
        question: "Does paying the $50 guarantee that my course will be published?",
        answer: "No. Education Partners must submit their courses for review. Membership does not guarantee publication of every course.",
      },
      {
        question: "Can I submit more than one course?",
        answer: "Yes. Education Partners can submit eligible courses through the course submission process.",
      },
      {
        question: "Can I list free courses?",
        answer: "Yes, if the course meets Act on Climate's education criteria. Free education is a welcome part of the ecosystem.",
      },
      {
        question: "Can I list workshops and short programs?",
        answer: "Yes. Eligible workshops, short courses, training programs and certificates can be submitted.",
      },
      {
        question: "Do I have to offer a certificate?",
        answer: "No. Certificates are not required. We welcome introductory through advanced programs.",
      },
      {
        question: "Will Act on Climate promote my course?",
        answer: "Eligible Education Partners may be considered for featured courses, newsletters, and promotional highlights.",
      },
    ],
  };
};

// ==========================================
// 2. Partner Onboarding & Survey
// ==========================================
const createOrUpdateSurvey = async (
  userId: string,
  payload: any,
  files?: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] }
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  let existingProfile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  let logoData = existingProfile?.logo;
  let coverData = existingProfile?.coverImage;

  if (files?.logo?.[0]) {
    const uploaded = await uploadToCloudinary(
      files.logo[0].path,
      "act_on_climate/partner_logos"
    );
    logoData = { public_id: uploaded.public_id, url: uploaded.secure_url };
  }

  if (files?.coverImage?.[0]) {
    const uploaded = await uploadToCloudinary(
      files.coverImage[0].path,
      "act_on_climate/partner_covers"
    );
    coverData = { public_id: uploaded.public_id, url: uploaded.secure_url };
  }

  if (existingProfile) {
    const slug =
      payload.organizationName &&
      payload.organizationName !== existingProfile.organizationName
        ? await generateSlug(
            payload.organizationName,
            PartnerProfile,
            existingProfile._id as Types.ObjectId
          )
        : existingProfile.slug;

    Object.assign(existingProfile, {
      ...payload,
      slug,
      ...(logoData && { logo: logoData }),
      ...(coverData && { coverImage: coverData }),
    });

    const updated = await existingProfile.save();
    return updated;
  }

  const slug = await generateSlug(payload.organizationName, PartnerProfile);

  const newProfile = await PartnerProfile.create({
    userId: user._id,
    ...payload,
    slug,
    logo: logoData || { public_id: "", url: "" },
    coverImage: coverData || { public_id: "", url: "" },
    membershipStatus: "pending_payment",
    membershipTier: "annual_standard",
    membershipFee: 50,
  });

  return newProfile;
};

// ==========================================
// 3. Partner Profile Management
// ==========================================
const getMyPartnerProfile = async (userId: string) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  }).populate("userId", "firstName lastName email image");

  if (!profile) {
    return {
      hasProfile: false,
      profile: null,
      message: "Please complete the Education Partner survey first.",
    };
  }

  return {
    hasProfile: true,
    profile,
  };
};

const updateMyPartnerProfile = async (
  userId: string,
  payload: any,
  files?: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] }
) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile) {
    throw new AppError(
      "Partner profile not found. Complete survey first.",
      StatusCodes.NOT_FOUND
    );
  }

  if (files?.logo?.[0]) {
    const uploaded = await uploadToCloudinary(
      files.logo[0].path,
      "act_on_climate/partner_logos"
    );
    payload.logo = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  if (files?.coverImage?.[0]) {
    const uploaded = await uploadToCloudinary(
      files.coverImage[0].path,
      "act_on_climate/partner_covers"
    );
    payload.coverImage = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  if (
    payload.organizationName &&
    payload.organizationName !== profile.organizationName
  ) {
    payload.slug = await generateSlug(
      payload.organizationName,
      PartnerProfile,
      profile._id as Types.ObjectId
    );
  }

  Object.assign(profile, payload);
  const updated = await profile.save();
  return updated;
};

// ==========================================
// 4. Membership Checkout & Activation ($50/year)
// ==========================================
const createMembershipCheckoutSession = async (
  userId: string,
  clientUrls?: { successUrl?: string; cancelUrl?: string }
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  let profile = await PartnerProfile.findOne({ userId: user._id });
  if (!profile) {
    throw new AppError(
      "Please fill out the Education Partner survey before purchasing membership.",
      StatusCodes.BAD_REQUEST
    );
  }

  const frontendUrl = config.frontendUrl || "http://localhost:3000";
  const successUrl =
    clientUrls?.successUrl ||
    `${frontendUrl}/partner/membership/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl =
    clientUrls?.cancelUrl || `${frontendUrl}/partner/membership/cancel`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Act on Climate — Education Partner Membership",
            description:
              "Annual Education Partner membership ($50/year). 0% commission, keep 100% course revenue.",
          },
          unit_amount: 50 * 100, // $50.00
        },
        quantity: 1,
      },
    ],
    metadata: {
      isEducationPartnerMembership: "true",
      userId: user._id.toString(),
      partnerProfileId: (profile._id as Types.ObjectId).toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  profile.stripeSessionId = session.id;
  await profile.save();

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const sendActivationEmail = async (
  partner: any,
  userEmail: string,
  userName: string
) => {
  const frontendUrl = config.frontendUrl || "https://actonclimate.org";
  const submitCourseUrl = `${frontendUrl}/partner/courses/new`;
  const dashboardUrl = `${frontendUrl}/partner/dashboard`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0d5c3a; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to Act on Climate!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Education Partner Membership Activated</p>
      </div>
      <div style="padding: 24px;">
        <p>Hello <strong>${userName || partner.organizationName}</strong>,</p>
        <p>Thank you for joining the <strong>Act on Climate Education Partnership Program</strong>! Your annual membership has been successfully activated.</p>
        
        <div style="background-color: #f7faf8; border-left: 4px solid #0d5c3a; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px;"><strong>Organization:</strong> ${partner.organizationName}</p>
          <p style="margin: 0 0 8px;"><strong>Annual Membership:</strong> $50.00 / year (Active)</p>
          <p style="margin: 0;"><strong>Commission:</strong> 0% (Keep 100% of your course revenue)</p>
        </div>

        <h3>Ready to submit your first course?</h3>
        <p>Your membership gives you a dedicated place within our climate education network. You can submit your climate, sustainability, renewable energy, and ESG courses or workshops at any time.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${submitCourseUrl}" style="background-color: #0d5c3a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; margin-right: 10px;">Submit Your First Course</a>
          <a href="${dashboardUrl}" style="background-color: #e2e8f0; color: #1a202c; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
        </div>

        <p>Once submitted, our team reviews each course for climate relevance and clarity before publishing it to the Act on Climate directory with direct links to your enrollment pages.</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
        <p style="font-size: 13px; color: #666; margin: 0;">If you have any questions or need assistance, simply reply to this email.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: userEmail || partner.contactEmail,
    subject: "🎉 Your Act on Climate Education Partner Membership is Active!",
    html,
  });
};

const activatePartnerMembership = async (
  partnerProfileId: string,
  stripeSessionId?: string
) => {
  const profile = await PartnerProfile.findById(partnerProfileId);
  if (!profile) {
    throw new AppError("Partner profile not found", StatusCodes.NOT_FOUND);
  }

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  profile.membershipStatus = "active";
  profile.isVerifiedPartner = true;
  profile.membershipStartDate = now;
  profile.membershipExpiresAt = nextYear;
  if (stripeSessionId) {
    profile.stripeSessionId = stripeSessionId;
  }

  const user = await User.findById(profile.userId);
  const userEmail = user?.email || profile.contactEmail;
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : profile.organizationName;

  if (!profile.activationEmailSent) {
    try {
      await sendActivationEmail(profile, userEmail, userName);
      profile.activationEmailSent = true;
    } catch (err: any) {
      logger.error("Failed to send activation email:", err);
    }
  }

  await profile.save();
  return profile;
};

// ==========================================
// 4B. Stripe Connect Payout Onboarding (100% Course Revenue to Partner)
// ==========================================
const createStripeConnectOnboardingLink = async (
  userId: string,
  clientUrls?: { returnUrl?: string; refreshUrl?: string }
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const profile = await PartnerProfile.findOne({ userId: user._id });
  if (!profile) {
    throw new AppError(
      "Please complete your Education Partner profile survey first.",
      StatusCodes.BAD_REQUEST
    );
  }

  const frontendUrl = config.frontendUrl || "http://localhost:3000";
  const returnUrl =
    clientUrls?.returnUrl || `${frontendUrl}/partner/stripe/return`;
  const refreshUrl =
    clientUrls?.refreshUrl || `${frontendUrl}/partner/stripe/refresh`;

  let accountId = profile.stripeConnectAccountId;

  // If no account exists yet, create an Express connected account
  if (!accountId) {
    const businessType =
      profile.organizationType === "independent_educator"
        ? "individual"
        : "company";

    const account = await stripe.accounts.create({
      type: "express",
      country: "US", // Default US or can be customized by country if needed
      email: profile.contactEmail || user.email,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        partnerProfileId: (profile._id as Types.ObjectId).toString(),
        userId: user._id.toString(),
        organizationName: profile.organizationName,
      },
    });

    accountId = account.id;
    profile.stripeConnectAccountId = accountId;
    profile.stripeConnectStatus = "pending";
    await profile.save();
  }

  // Create an Account Link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return {
    onboardingUrl: accountLink.url,
    stripeConnectAccountId: accountId,
    expiresAt: accountLink.expires_at,
  };
};

const getStripeConnectStatus = async (userId: string) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile) {
    throw new AppError("Partner profile not found", StatusCodes.NOT_FOUND);
  }

  if (!profile.stripeConnectAccountId) {
    return {
      connected: false,
      status: "not_connected",
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }

  // Fetch real-time account status from Stripe
  const account = await stripe.accounts.retrieve(profile.stripeConnectAccountId);

  const chargesEnabled = Boolean(account.charges_enabled);
  const payoutsEnabled = Boolean(account.payouts_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);

  let status: "not_connected" | "pending" | "active" | "restricted" = "pending";
  if (chargesEnabled && payoutsEnabled) {
    status = "active";
  } else if (account.requirements?.disabled_reason) {
    status = "restricted";
  } else {
    status = "pending";
  }

  profile.stripeChargesEnabled = chargesEnabled;
  profile.stripePayoutsEnabled = payoutsEnabled;
  profile.stripeDetailsSubmitted = detailsSubmitted;
  profile.stripeConnectStatus = status;

  if (status === "active" && !profile.stripeConnectOnboardedAt) {
    profile.stripeConnectOnboardedAt = new Date();
  }

  await profile.save();

  return {
    connected: true,
    stripeConnectAccountId: profile.stripeConnectAccountId,
    status: profile.stripeConnectStatus,
    chargesEnabled: profile.stripeChargesEnabled,
    payoutsEnabled: profile.stripePayoutsEnabled,
    detailsSubmitted: profile.stripeDetailsSubmitted,
    stripeConnectOnboardedAt: profile.stripeConnectOnboardedAt,
  };
};

const createStripeConnectDashboardLink = async (userId: string) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile || !profile.stripeConnectAccountId) {
    throw new AppError(
      "No Stripe connected account found for this partner.",
      StatusCodes.BAD_REQUEST
    );
  }

  const loginLink = await stripe.accounts.createLoginLink(
    profile.stripeConnectAccountId
  );

  return {
    url: loginLink.url,
  };
};

const submitCourse = async (
  userId: string,
  payload: any,
  file?: Express.Multer.File
) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile) {
    throw new AppError(
      "You must create an Education Partner profile before submitting courses.",
      StatusCodes.FORBIDDEN
    );
  }

  let coverData = { public_id: "", url: "" };
  if (file) {
    const uploaded = await uploadToCloudinary(
      file.path,
      "act_on_climate/partner_course_covers"
    );
    coverData = { public_id: uploaded.public_id, url: uploaded.secure_url };
  }

  const slug = await generateSlug(payload.title, Course);

  const categories = Array.isArray(payload.categories)
    ? payload.categories
    : payload.categories
    ? [payload.categories]
    : [];

  const newCourse = await Course.create({
    providerId: profile._id,
    userId: new Types.ObjectId(userId),
    source: "PARTNER",
    status: "submitted",
    isAvailable: false,
    ...payload,
    category: categories[0] || payload.category || "Educational Courses",
    categories,
    slug,
    image: coverData,
    coverImage: coverData,
  });

  await PartnerProfile.findByIdAndUpdate(profile._id, {
    $inc: { totalCoursesCount: 1 },
  });

  return newCourse;
};

const getMyCourses = async (userId: string, query: any) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile) {
    return { meta: { total: 0, page: 1, limit: 10, totalPage: 0 }, data: [] };
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { providerId: profile._id };

  if (query.status) {
    filter.status = query.status;
  }
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { summary: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { categories: { $regex: query.search, $options: "i" } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: courses,
  };
};

const getCourseById = async (userId: string, courseId: string) => {
  const course = await Course.findById(courseId).populate(
    "providerId",
    "organizationName slug website logo isVerifiedPartner"
  );

  if (!course) {
    throw new AppError("Course not found", StatusCodes.NOT_FOUND);
  }

  // Ensure owner or admin can view draft/submitted details
  if (course.userId?.toString() !== userId) {
    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      throw new AppError("Unauthorized to view this course", StatusCodes.UNAUTHORIZED);
    }
  }

  return course;
};

const updateCourse = async (
  userId: string,
  courseId: string,
  payload: any,
  file?: Express.Multer.File
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", StatusCodes.NOT_FOUND);
  }

  if (course.userId?.toString() !== userId) {
    throw new AppError(
      "You are not authorized to update this course",
      StatusCodes.UNAUTHORIZED
    );
  }

  if (file) {
    const uploaded = await uploadToCloudinary(
      file.path,
      "act_on_climate/partner_course_covers"
    );
    payload.coverImage = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
    payload.image = payload.coverImage;
  }

  if (payload.title && payload.title !== course.title) {
    payload.slug = await generateSlug(
      payload.title,
      Course,
      course._id as Types.ObjectId
    );
  }

  // If re-submitting after revision requested
  if (payload.resubmit) {
    payload.status = "submitted";
    payload.isAvailable = false;
  }

  Object.assign(course, payload);
  const updated = await course.save();
  return updated;
};

const deleteCourse = async (userId: string, courseId: string) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", StatusCodes.NOT_FOUND);
  }

  if (course.userId?.toString() !== userId) {
    throw new AppError(
      "You are not authorized to delete this course",
      StatusCodes.UNAUTHORIZED
    );
  }

  await Course.findByIdAndDelete(courseId);
  await CourseClick.deleteMany({ courseId: course._id });

  if (course.providerId) {
    await PartnerProfile.findByIdAndUpdate(course.providerId, {
      $inc: {
        totalCoursesCount: -1,
        ...(course.status === "approved" ? { approvedCoursesCount: -1 } : {}),
      },
    });
  }

  return { message: "Course deleted successfully" };
};

// ==========================================
// 6. Partner Engagement Insights & Analytics
// ==========================================
const getPartnerAnalytics = async (userId: string) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile) {
    throw new AppError("Partner profile not found", StatusCodes.NOT_FOUND);
  }

  const [totalCourses, approvedCourses, totalClicks, courses] = await Promise.all([
    Course.countDocuments({ providerId: profile._id }),
    Course.countDocuments({ providerId: profile._id, status: "approved" }),
    CourseClick.countDocuments({ partnerId: profile._id }),
    Course.find({ providerId: profile._id })
      .select("title slug status isFree price currency viewCount clickCount createdAt")
      .sort({ clickCount: -1 }),
  ]);

  const totalViews = courses.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);

  // Recent 30 days daily clicks
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const clicksByDay = await CourseClick.aggregate([
    {
      $match: {
        partnerId: profile._id,
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    partner: {
      organizationName: profile.organizationName,
      membershipStatus: profile.membershipStatus,
      isVerifiedPartner: profile.isVerifiedPartner,
      membershipExpiresAt: profile.membershipExpiresAt,
    },
    metrics: {
      totalCourses,
      approvedCourses,
      totalViews,
      totalOutboundClicks: totalClicks,
      clickThroughRate:
        totalViews > 0
          ? `${((totalClicks / totalViews) * 100).toFixed(1)}%`
          : "0.0%",
    },
    coursesPerformance: courses,
    clicksTrend: clicksByDay.map((item) => ({
      date: item._id,
      clicks: item.clicks,
    })),
  };
};

// ==========================================
// 7. Public Directory & Course Catalog
// ==========================================
const getAllPublicPartners = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter: any = {
    membershipStatus: "active",
  };

  if (query.organizationType) {
    filter.organizationType = query.organizationType;
  }
  if (query.category) {
    filter.$or = [
      { areasOfExpertise: { $regex: query.category, $options: "i" } },
      { typesOfClimateEducation: { $regex: query.category, $options: "i" } },
    ];
  }
  if (query.search) {
    filter.$or = [
      { organizationName: { $regex: query.search, $options: "i" } },
      { bio: { $regex: query.search, $options: "i" } },
      { areasOfExpertise: { $regex: query.search, $options: "i" } },
    ];
  }

  const [partners, total] = await Promise.all([
    PartnerProfile.find(filter)
      .select(
        "organizationName slug organizationType website logo coverImage tagline bio areasOfExpertise isVerifiedPartner totalCoursesCount approvedCoursesCount createdAt"
      )
      .sort({ isVerifiedPartner: -1, approvedCoursesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PartnerProfile.countDocuments(filter),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: partners,
  };
};

const getPublicPartnerBySlug = async (slug: string) => {
  const partner = await PartnerProfile.findOne({
    slug: slug.toLowerCase(),
  }).select(
    "organizationName slug organizationType website logo coverImage tagline bio areasOfExpertise targetAudience educationalOfferings typesOfClimateEducation instructorNames contactEmail contactPhone isVerifiedPartner approvedCoursesCount createdAt"
  );

  if (!partner) {
    throw new AppError("Education partner not found", StatusCodes.NOT_FOUND);
  }

  const courses = await Course.find({
    providerId: partner._id,
    status: "approved",
    isAvailable: true,
  })
    .select(
      "title slug summary categories category format duration isFree price currency hasCertificate image coverImage isFeatured viewCount clickCount createdAt"
    )
    .sort({ isFeatured: -1, createdAt: -1 });

  return {
    partner,
    courses,
  };
};

const getAllPublicCourses = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter: any = {
    status: "approved",
    isAvailable: true,
  };

  if (query.source) {
    filter.source = query.source.toUpperCase();
  }

  if (query.category) {
    filter.$or = [
      { category: { $regex: query.category, $options: "i" } },
      { categories: { $regex: query.category, $options: "i" } },
    ];
  }
  if (query.format) {
    filter.format = query.format;
  }
  if (query.isFree !== undefined) {
    filter.isFree = query.isFree === "true" || query.isFree === true;
  }
  if (query.hasCertificate !== undefined) {
    filter.hasCertificate =
      query.hasCertificate === "true" || query.hasCertificate === true;
  }
  if (query.partnerSlug) {
    const partner = await PartnerProfile.findOne({ slug: query.partnerSlug });
    if (partner) {
      filter.providerId = partner._id;
    }
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { summary: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { category: { $regex: query.search, $options: "i" } },
      { categories: { $regex: query.search, $options: "i" } },
      { targetAudience: { $regex: query.search, $options: "i" } },
    ];
  }

  const sort: any = {};
  if (query.sortBy === "price_asc") {
    sort.price = 1;
  } else if (query.sortBy === "price_desc") {
    sort.price = -1;
  } else if (query.sortBy === "popular") {
    sort.clickCount = -1;
  } else {
    sort.isFeatured = -1;
    sort.featuredOrder = 1;
    sort.createdAt = -1;
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("providerId", "organizationName slug logo isVerifiedPartner website")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: courses,
  };
};

const getPublicCourseBySlug = async (slug: string) => {
  const course = await Course.findOneAndUpdate(
    { slug: slug.toLowerCase(), status: "approved", isAvailable: true },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate(
    "providerId",
    "organizationName slug website logo coverImage tagline bio areasOfExpertise isVerifiedPartner"
  );

  if (!course) {
    throw new AppError("Course not found or not published", StatusCodes.NOT_FOUND);
  }

  return course;
};

const trackCourseOutboundClick = async (
  courseId: string,
  reqMeta?: { userId?: string; ip?: string; userAgent?: string; referrer?: string }
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", StatusCodes.NOT_FOUND);
  }

  await Promise.all([
    Course.findByIdAndUpdate(courseId, { $inc: { clickCount: 1 } }),
    CourseClick.create({
      courseId: course._id,
      partnerId: course.providerId || course.userId,
      userId: reqMeta?.userId ? new Types.ObjectId(reqMeta.userId) : undefined,
      ipAddress: reqMeta?.ip,
      userAgent: reqMeta?.userAgent,
      referrer: reqMeta?.referrer,
    }),
  ]);

  return {
    courseId: course._id,
    title: course.title,
    enrollmentUrl: course.enrollmentUrl || course.courseBoxUrl,
  };
};

// ==========================================
// 8. Admin Moderation & Review Queue
// ==========================================
const getAdminReviewQueue = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { source: "PARTNER" };
  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = { $in: ["submitted", "under_review", "revision_requested"] };
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { summary: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("providerId", "organizationName slug website contactEmail isVerifiedPartner membershipStatus")
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: courses,
  };
};

const adminReviewCourse = async (
  adminUserId: string,
  courseId: string,
  payload: {
    status: "approved" | "rejected" | "revision_requested" | "under_review" | "archived";
    adminReviewNotes?: string;
    isFeatured?: boolean;
    featuredOrder?: number;
  }
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", StatusCodes.NOT_FOUND);
  }

  const previousStatus = course.status;
  course.status = payload.status;
  // If approved, automatically make available in directory and set published date
  if (payload.status === "approved") {
    course.isAvailable = true;
    course.publishedAt = new Date();
  } else if (payload.status === "rejected" || payload.status === "archived") {
    course.isAvailable = false;
  }

  if (payload.adminReviewNotes !== undefined) {
    course.adminReviewNotes = payload.adminReviewNotes;
  }
  if (payload.isFeatured !== undefined) {
    course.isFeatured = payload.isFeatured;
  }
  if (payload.featuredOrder !== undefined) {
    course.featuredOrder = payload.featuredOrder;
  }
  course.reviewedBy = new Types.ObjectId(adminUserId);
  course.reviewedAt = new Date();

  await course.save();

  // Adjust approved course counter on PartnerProfile
  if (course.providerId) {
    if (previousStatus !== "approved" && payload.status === "approved") {
      await PartnerProfile.findByIdAndUpdate(course.providerId, {
        $inc: { approvedCoursesCount: 1 },
      });
    } else if (previousStatus === "approved" && payload.status !== "approved") {
      await PartnerProfile.findByIdAndUpdate(course.providerId, {
        $inc: { approvedCoursesCount: -1 },
      });
    }
  }

  return course;
};

const getAllPartnersAdmin = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.membershipStatus) {
    filter.membershipStatus = query.membershipStatus;
  }
  if (query.isVerified !== undefined) {
    filter.isVerifiedPartner = query.isVerified === "true" || query.isVerified === true;
  }
  if (query.search) {
    filter.$or = [
      { organizationName: { $regex: query.search, $options: "i" } },
      { contactEmail: { $regex: query.search, $options: "i" } },
      { website: { $regex: query.search, $options: "i" } },
    ];
  }

  const [partners, total] = await Promise.all([
    PartnerProfile.find(filter)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PartnerProfile.countDocuments(filter),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: partners,
  };
};

const adminUpdatePartnerStatus = async (
  partnerId: string,
  payload: {
    membershipStatus?: "pending_payment" | "active" | "past_due" | "canceled" | "expired";
    isVerifiedPartner?: boolean;
    membershipExpiresAt?: Date;
  }
) => {
  const partner = await PartnerProfile.findById(partnerId);
  if (!partner) {
    throw new AppError("Partner profile not found", StatusCodes.NOT_FOUND);
  }

  Object.assign(partner, payload);
  await partner.save();
  return partner;
};

const confirmMembershipPayment = async (userId: string, _paymentData?: any) => {
  const profile = await PartnerProfile.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!profile) {
    throw new AppError(
      "Partner profile not found. Complete survey first.",
      StatusCodes.NOT_FOUND
    );
  }

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  profile.membershipStatus = "active";
  profile.isVerifiedPartner = false; // Remains false pending admin approval!
  profile.membershipStartDate = now;
  profile.membershipExpiresAt = nextYear;

  await profile.save();
  return profile;
};

export const educationPartnerService = {
  getProgramInfo,
  createOrUpdateSurvey,
  getMyPartnerProfile,
  updateMyPartnerProfile,
  createMembershipCheckoutSession,
  activatePartnerMembership,
  confirmMembershipPayment,
  createStripeConnectOnboardingLink,
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
};
