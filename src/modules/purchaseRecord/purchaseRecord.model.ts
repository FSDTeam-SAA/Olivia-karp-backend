import { model, Schema } from "mongoose";
import { IPurchaseRecord } from "./purchaseRecord.interface";

const purchaseRecordSchema = new Schema<IPurchaseRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemType: {
      type: String,
      enum: ["course", "event", "careerService"],
      required: true,
    },
    itemId: { type: Schema.Types.ObjectId, required: true }, // ref dynamically checked
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    basePrice: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },
    currency: { type: String, default: "CAD" },
    transactionId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["paid", "unpaid", "free"],
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

// Indexes
purchaseRecordSchema.index({ userId: 1, itemType: 1 });
purchaseRecordSchema.index({ itemId: 1 });
purchaseRecordSchema.index({ status: 1 });
purchaseRecordSchema.index({ transactionId: 1 });

const PurchaseRecord = model<IPurchaseRecord>(
  "PurchaseRecord",
  purchaseRecordSchema,
);

export default PurchaseRecord;
