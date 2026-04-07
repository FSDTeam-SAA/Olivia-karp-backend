import { Types } from "mongoose";

export type TSubscriptionStatus = "active" | "expired" | "cancelled";

export interface IPurchaseSubscription {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  paymentId: Types.ObjectId;
  purchaseDate: Date;
  expirationDate: Date;
  status: TSubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}
