import { Types } from "mongoose";

export interface IEnrollCourse {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  transactionId?: string;
  paymentStatus?: "pending" | "paid" | "failed";
}
