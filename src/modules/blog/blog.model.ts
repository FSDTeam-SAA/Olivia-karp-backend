import { Schema, model } from 'mongoose';
import { IBlog, IBlogAuthor } from './blog.interface';

const authorSchema = new Schema<IBlogAuthor>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    profileImage: {
        url: String,
        public_id: String
    },
}, { _id: false }); // We don't need a separate ID for the sub-document

const blogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            enum: ['Expert Insights', 'Climate Careers', 'Research', 'Toolkit', 'Renewable Energy'],
            required: true
        },
        thumbnailImage: {
            url: String,
            public_id: String
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: authorSchema,
            required: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isPublished: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

// Search optimization for the "Our Blog" search bar
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ category: 1, isPublished: 1 });

export const Blog = model<IBlog>('Blog', blogSchema);