import { Types } from 'mongoose';

export type TCourseSource = 'ADMIN' | 'PARTNER';

export type TCourseStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_requested'
  | 'archived';

export type TCourseFormat =
  | 'online_self_paced'
  | 'online_cohort'
  | 'in_person'
  | 'hybrid'
  | 'workshop'
  | 'short_course'
  | 'certificate_program';

export interface ILesson {
  title: string;
  videoUrl: string;
}

export interface IImage {
  url: string;
  public_id: string;
}

export interface ICourse {
  _id?: Types.ObjectId | string;
  title: string;
  slug?: string;
  category: string;
  categories?: string[];
  difficulty?: string;
  instructorName?: string;
  instructorBio?: string;
  instructorImage?: IImage;
  instructorDetails?: string;
  description?: string;
  summary?: string;
  learningOutcomes?: string[];
  targetAudience?: string;
  durationHours?: number;
  duration?: string;
  estimatedWeeks?: number;
  lessons?: ILesson[];
  image?: IImage;
  coverImage?: IImage;
  isLocked?: boolean;
  isAvailable?: boolean;
  price?: number;
  isFree?: boolean;
  courseBoxUrl?: string;
  enrollmentUrl?: string;
  currency?: string;
  totalEnrolled?: number;

  // Unified Catalog fields
  source: TCourseSource;
  status: TCourseStatus;
  providerId?: Types.ObjectId; // Ref: PartnerProfile
  userId?: Types.ObjectId;     // Ref: User who submitted or created

  // Partner specific options & tracking
  format?: TCourseFormat;
  hasCertificate?: boolean;
  certificateDetails?: string;
  prerequisites?: string;
  isFeatured?: boolean;
  featuredOrder?: number;
  viewCount?: number;
  clickCount?: number;

  // Admin moderation fields
  adminReviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  publishedAt?: Date;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

