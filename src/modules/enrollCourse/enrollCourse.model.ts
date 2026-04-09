import mongoose, { model, Schema } from "mongoose";
import { IEnrollCourse } from "./enrollCourse.interface";

const enrollCourseSchema = new Schema<IEnrollCourse>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    transactionId: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "free"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const EnrollCourse = model("EnrollCourse", enrollCourseSchema);
export default EnrollCourse;
