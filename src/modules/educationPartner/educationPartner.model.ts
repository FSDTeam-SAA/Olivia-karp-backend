import { Schema, model } from "mongoose";
import {
  ICourseClick,
  ICourseClickModel,
  IPartnerCourse,
  IPartnerCourseModel,
  IPartnerProfile,
  IPartnerProfileModel,
} from "./educationPartner.interface";

// ==========================================
// 1. Education Partner Profile Schema
// ==========================================
const PartnerProfileSchema = new Schema<IPartnerProfile, IPartnerProfileModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    organizationType: {
      type: String,
      enum: [
        "university",
        "college",
        "nonprofit",
        "ngo",
        "professional_education",
        "training_organization",
        "industry_association",
        "company",
        "independent_educator",
        "other",
      ],
      required: [true, "Organization type is required"],
    },
    website: {
      type: String,
      required: [true, "Website is required"],
      trim: true,
    },
    logo: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    coverImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    tagline: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Organization bio/description is required"],
    },
    areasOfExpertise: [{ type: String, trim: true }],
    targetAudience: [{ type: String, trim: true }],
    educationalOfferings: [{ type: String, trim: true }],
    typesOfClimateEducation: [{ type: String, trim: true }],
    instructorNames: [{ type: String, trim: true }],
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },

    // Membership & Subscription ($50/year)
    membershipStatus: {
      type: String,
      enum: ["pending_payment", "active", "past_due", "canceled", "expired"],
      default: "pending_payment",
    },
    membershipTier: {
      type: String,
      default: "annual_standard",
    },
    membershipFee: {
      type: Number,
      default: 50,
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeSessionId: { type: String },
    membershipStartDate: { type: Date },
    membershipExpiresAt: { type: Date },
    isVerifiedPartner: {
      type: Boolean,
      default: false,
    },
    activationEmailSent: {
      type: Boolean,
      default: false,
    },

    totalCoursesCount: {
      type: Number,
      default: 0,
    },
    approvedCoursesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PartnerProfileSchema.index({ organizationName: "text", bio: "text", areasOfExpertise: "text" });

// ==========================================
// 2. Partner Course Schema
// ==========================================
const PartnerCourseSchema = new Schema<IPartnerCourse, IPartnerCourseModel>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerProfile",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Course summary is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    learningOutcomes: [{ type: String, trim: true }],
    targetAudience: {
      type: String,
      required: [true, "Target audience description is required"],
    },
    instructorDetails: {
      type: String,
    },
    categories: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    format: {
      type: String,
      enum: [
        "online_self_paced",
        "online_cohort",
        "in_person",
        "hybrid",
        "workshop",
        "short_course",
        "certificate_program",
      ],
      required: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required (e.g. '6 weeks', '4 hours')"],
    },

    // 0% Commission - direct partner sales
    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },

    hasCertificate: {
      type: Boolean,
      default: false,
    },
    certificateDetails: {
      type: String,
    },
    prerequisites: {
      type: String,
    },

    enrollmentUrl: {
      type: String,
      required: [true, "Direct enrollment or registration URL is required"],
      trim: true,
    },
    coverImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    // Review & Approval Lifecycle
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "revision_requested",
        "archived",
      ],
      default: "submitted",
    },
    adminReviewNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },

    // Visibility & Analytics
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PartnerCourseSchema.index({
  title: "text",
  summary: "text",
  description: "text",
  categories: "text",
});
PartnerCourseSchema.index({ partnerId: 1, status: 1 });
PartnerCourseSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

// ==========================================
// 3. Course Click Analytics Schema
// ==========================================
const CourseClickSchema = new Schema<ICourseClick, ICourseClickModel>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "PartnerProfile",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    referrer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

CourseClickSchema.index({ courseId: 1, createdAt: -1 });
CourseClickSchema.index({ partnerId: 1, createdAt: -1 });

export const PartnerProfile = model<IPartnerProfile, IPartnerProfileModel>(
  "PartnerProfile",
  PartnerProfileSchema
);

export const PartnerCourse = model<IPartnerCourse, IPartnerCourseModel>(
  "PartnerCourse",
  PartnerCourseSchema
);

export const CourseClick = model<ICourseClick, ICourseClickModel>(
  "CourseClick",
  CourseClickSchema
);
