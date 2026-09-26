import { Document, Model, Types } from "mongoose";

export type TOrganizationType =
  | "university"
  | "college"
  | "nonprofit"
  | "ngo"
  | "professional_education"
  | "training_organization"
  | "industry_association"
  | "company"
  | "independent_educator"
  | "other";

export type TMembershipStatus =
  | "pending_payment"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type TCourseFormat =
  | "online_self_paced"
  | "online_cohort"
  | "in_person"
  | "hybrid"
  | "workshop"
  | "short_course"
  | "certificate_program";

export type TCourseStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "revision_requested"
  | "archived";

export interface IPartnerProfile extends Document {
  userId: Types.ObjectId;
  organizationName: string;
  slug: string;
  organizationType: TOrganizationType;
  website: string;
  logo?: {
    public_id: string;
    url: string;
  };
  coverImage?: {
    public_id: string;
    url: string;
  };
  tagline?: string;
  bio: string;
  areasOfExpertise: string[];
  targetAudience: string[];
  educationalOfferings: string[];
  typesOfClimateEducation: string[];
  instructorNames: string[];
  contactEmail: string;
  contactPhone?: string;

  // Membership & Subscription details ($50/year)
  membershipStatus: TMembershipStatus;
  membershipTier: string;
  membershipFee: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSessionId?: string;
  membershipStartDate?: Date;
  membershipExpiresAt?: Date;
  isVerifiedPartner: boolean;
  activationEmailSent: boolean;

  // Stripe Connect (Payouts to Partner - 100% Course Sales)
  stripeConnectAccountId?: string;
  stripeConnectStatus?: "not_connected" | "pending" | "active" | "restricted";
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeDetailsSubmitted?: boolean;
  stripeConnectOnboardedAt?: Date;

  totalCoursesCount: number;
  approvedCoursesCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IPartnerCourse extends Document {
  partnerId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  description: string;
  learningOutcomes: string[];
  targetAudience: string;
  instructorDetails?: string;

  categories: string[];
  format: TCourseFormat;
  duration: string;

  // Pricing (0% commission, keep 100%)
  isFree: boolean;
  price?: number;
  currency?: string;

  hasCertificate: boolean;
  certificateDetails?: string;
  prerequisites?: string;

  enrollmentUrl: string; // Outbound link to partner website / LMS
  coverImage?: {
    public_id: string;
    url: string;
  };

  // Review & Approval Lifecycle
  status: TCourseStatus;
  adminReviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  // Visibility & Analytics
  isFeatured: boolean;
  featuredOrder?: number;
  viewCount: number;
  clickCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseClick extends Document {
  courseId: Types.ObjectId;
  partnerId: Types.ObjectId;
  userId?: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
}

export interface IPartnerProfileModel extends Model<IPartnerProfile> {}
export interface IPartnerCourseModel extends Model<IPartnerCourse> {}
export interface ICourseClickModel extends Model<ICourseClick> {}
