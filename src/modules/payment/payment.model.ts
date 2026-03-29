import { model, Schema } from "mongoose";
import { IPayment } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      // required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// 🔥 Index for performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ subscriptionPlan: 1 });
paymentSchema.index({ status: 1 });

// 🔥 Optional: auto-generate paymentId if not provided
paymentSchema.pre("validate", function (next) {
  if (!this.paymentId) {
    this.paymentId = `PAY-${Date.now()}`;
  }
  next();
});

const Payment = model<IPayment>("Payment", paymentSchema);
export default Payment;
