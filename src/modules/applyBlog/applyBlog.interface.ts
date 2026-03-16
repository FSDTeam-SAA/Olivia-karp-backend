import { Document, Types } from 'mongoose';

export type TBlogCategory =
    | 'Expert Insights'
    | 'Climate Careers'
    | 'Research'
    | 'Toolkit'
    | 'Renewable Energy';

export type TApplyBlogStatus =
    | 'pending'
    | 'published'
    | 'reviewed'
    | 'accepted'
    | 'rejected';

export interface IApplyBlogAuthor {
    name: string;
    description: string;
    profileImage: {
        url: string;
        public_id: string;
    };
}

export interface IApplyBlog extends Document {
    user: Types.ObjectId; // The submitter (User) or the writer (Admin)
    title: string;
    category: TBlogCategory;
    thumbnailImage?: {
        url: string;
        public_id: string;
    };
    content?: string;
    author?: IApplyBlogAuthor;
    status: TApplyBlogStatus;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}