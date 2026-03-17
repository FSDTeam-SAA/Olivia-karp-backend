import { model, Schema } from "mongoose";
import { ICourse, ILesson } from "./course.interface";

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  isLocked: { type: Boolean, default: false },
  level: { type: String, required: true },
  videoUrl: { type: String, required: true },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    lessonsCount: { type: Number },
    totalDuration: { type: String },
    lessons: { type: [LessonSchema], default: [] },
    isLocked: { type: Boolean, default: false },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
  },
  { timestamps: true, versionKey: false },
);

const Course = model<ICourse>("Course", CourseSchema);
export default Course;
