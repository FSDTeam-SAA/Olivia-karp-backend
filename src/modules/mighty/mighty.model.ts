import { Schema, model } from 'mongoose';

const planSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  interval: { type: String, enum: ["month", "year"], required: true },
  mightyRedirectUrl: { type: String, required: true }, // The MN Share Link
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

export const Plan = model('Plan', planSchema);