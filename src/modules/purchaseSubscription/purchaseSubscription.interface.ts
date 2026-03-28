import { Types } from "mongoose";

export interface IPurchaseSubscription {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
