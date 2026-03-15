import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User", // This must match your User model name
            required: [true, "User ID is required to link the review"],
        },
        comment: {
            type: String,
            required: [true, "Comment is required"],
            trim: true,
        },
        rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5], // The Enum way
            required: [true, "Rating is required"],
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Review = model<IReview>("Review", reviewSchema);