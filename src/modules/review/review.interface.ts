import { Types } from "mongoose";

// Defining the rating scale as a strict type
export type TRating = 1 | 2 | 3 | 4 | 5;

export interface IReview {
    // The Link: Pulls Name, Image, and Role from your User Database
    user: Types.ObjectId;

    // The content
    comment: string;

    // Rating using the Enum logic
    rating: TRating;

    // Admin controls
    isApproved: boolean;
    isFeatured: boolean;
}