import { Types } from "mongoose";

export interface IPayment {
  paymentId: string;
  userId: Types.ObjectId;
  subscriptionPlanId: Types.ObjectId;
  transactionId: string;
  status: "paid" | "unpaid";
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
