import { model, Schema } from 'mongoose';
import { ICourse, ILesson } from './course.interface';

/* -------------------- Lesson Schema -------------------- */
const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String },
    videoUrl: { type: String },
  },
  { _id: false },
);

/* -------------------- Image Schema -------------------- */
const ImageSchema = new Schema(
  {
    url: { type: String },
    public_id: { type: String },
  },
  { _id: false },
);

/* -------------------- Course Schema -------------------- */
const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    category: { type: String, default: 'Educational Courses' },
    categories: [{ type: String, trim: true }],
    difficulty: { type: String, default: 'Beginner' },
    instructorName: { type: String },
    instructorBio: { type: String },
    instructorImage: { type: ImageSchema },
    instructorDetails: { type: String },
    description: { type: String },
    summary: { type: String },
    learningOutcomes: [{ type: String, trim: true }],
    targetAudience: { type: String },
    durationHours: { type: Number, default: 0 },
    duration: { type: String },
    estimatedWeeks: { type: Number, default: 0 },
    lessons: { type: [LessonSchema], default: [] },
    image: { type: ImageSchema },
    coverImage: { type: ImageSchema },
    courseBoxUrl: {
      type: String,
      trim: true,
    },
    enrollmentUrl: {
      type: String,
      trim: true,
    },
    isAvailable: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'CAD', trim: true },
    totalEnrolled: { type: Number, default: 0 },

    // Unified Catalog source & status
    source: {
      type: String,
      enum: ['ADMIN', 'PARTNER'],
      default: 'ADMIN',
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'revision_requested',
        'archived',
      ],
      default: 'approved',
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'PartnerProfile',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Partner course format and extras
    format: {
      type: String,
      enum: [
        'online_self_paced',
        'online_cohort',
        'in_person',
        'hybrid',
        'workshop',
        'short_course',
        'certificate_program',
      ],
    },
    hasCertificate: { type: Boolean, default: false },
    certificateDetails: { type: String },
    prerequisites: { type: String },
    isFeatured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },

    // Admin moderation & review
    adminReviewNotes: { type: String },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

CourseSchema.index({ status: 1, isAvailable: 1, isFeatured: -1, createdAt: -1 });
CourseSchema.index({ providerId: 1, status: 1 });
CourseSchema.index({ title: 'text', summary: 'text', description: 'text', category: 'text' });

const Course = model<ICourse>('Course', CourseSchema);
export default Course;

