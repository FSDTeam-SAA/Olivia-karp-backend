import { Types } from "mongoose";

export type TPurchaseItemType = "course" | "event" | "careerService";

export interface IPurchaseRecord {
  userId: Types.ObjectId;
  itemType: TPurchaseItemType;
  itemId: Types.ObjectId;
  paymentId: Types.ObjectId | null;
  basePrice: number;
  discountApplied: number; // percentage
  finalPrice: number;
  currency: string;
  transactionId?: string;
  status: "paid" | "unpaid" | "free";
  createdAt: Date;
  updatedAt: Date;
}
