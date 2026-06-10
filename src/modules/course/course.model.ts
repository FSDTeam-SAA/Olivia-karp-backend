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
    title: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    instructorName: { type: String },
    instructorBio: { type: String },
    instructorImage: { type: ImageSchema },
    description: { type: String },
    durationHours: { type: Number, required: true },
    estimatedWeeks: { type: Number, required: true },
    lessons: { type: [LessonSchema], default: [] },
    image: { type: ImageSchema },
    courseBoxUrl: {
      type: String,
      trim: true,
    },
    isAvailable: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'CAD', trim: true },
    totalEnrolled: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Course = model<ICourse>('Course', CourseSchema);
export default Course;
