import { Types } from "mongoose";

export interface IPurchaseSubscription {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  status: "approved" | "pending" | "rejected";
  purchaseDate: Date;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
