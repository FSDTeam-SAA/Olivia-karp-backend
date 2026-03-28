import { Types } from "mongoose";

export interface IPurchaseSubscription {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  paymentId: Types.ObjectId;
  purchaseDate: Date;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
