import { model, Schema } from "mongoose";
import { IPurchaseSubscription } from "./purchaseSubscription.interface";

const purchaseSubscriptionSchema = new Schema<IPurchaseSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      // required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expirationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

//  Validation: expirationDate must be greater than purchaseDate
purchaseSubscriptionSchema.pre("save", function (next) {
  if (this.expirationDate <= this.purchaseDate) {
    return next(
      new Error("Expiration date must be greater than purchase date"),
    );
  }
  next();
});

// 🔥 Index (performance optimization)
purchaseSubscriptionSchema.index({ userId: 1 });
purchaseSubscriptionSchema.index({ subscriptionId: 1 });

const PurchaseSubscription = model<IPurchaseSubscription>(
  "PurchaseSubscription",
  purchaseSubscriptionSchema,
);

export default PurchaseSubscription;
