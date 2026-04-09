import { model, Schema } from "mongoose";
import { ICourse, ILesson } from "./course.interface";

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  videoUrl: { type: String, required: true },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    category: { type: String },
    picture:  {type: String},
    description: {type: String},
    lessonCount: { type: Number },
    totalDuration: { type: String },
    lessons: { type: [LessonSchema], default: [] },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "CAD", trim: true },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    isAvailable: { type: Boolean, default: true },
    totalEnrolled: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

const Course = model<ICourse>("Course", CourseSchema);
export default Course;
