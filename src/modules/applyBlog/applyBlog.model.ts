import { Schema, model } from 'mongoose';
import { IApplyBlog } from './applyBlog.interface';

const applyBlogSchema = new Schema<IApplyBlog>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        title: {
            type: String,
            required: [true, 'Blog title is required'],
            trim: true,
        },
        category: {
            type: String,
            enum: [
                'Expert Insights',
                'Climate Careers',
                'Research',
                'Toolkit',
                'Renewable Energy',
            ],
            required: [true, 'Category is required'],
        },
        thumbnailImage: {
            url: { type: String },
            public_id: { type: String },
        },
        content: {
            type: String,
        },
        author: {
            name: { type: String, trim: true },
            description: { type: String },
            profileImage: {
                url: { type: String },
                public_id: { type: String },
            },
        },
        status: {
            type: String,
            enum: ['pending', 'published', 'reviewed', 'accepted', 'rejected'],
            default: 'pending',
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
        versionKey: false,
    },
);

// Search optimization: indexing title and status for faster dashboard queries
applyBlogSchema.index({ title: 'text' });
applyBlogSchema.index({ status: 1 });

export const ApplyBlog = model<IApplyBlog>('ApplyBlog', applyBlogSchema);