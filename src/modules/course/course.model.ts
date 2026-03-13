import { Schema, model } from 'mongoose';
import { ICourseIdea } from './course.interface';

const CourseIdeaSchema = new Schema<ICourseIdea>(
    {
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        skillLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            required: true,
        },
        description: { type: String, required: true },
        keyTopics: [{ type: String }], // Array of strings for flexibility
        whoIsThisCourseFor: { type: String, required: true },
        yourName: { type: String, required: true },
        yourEmail: { type: String, required: true },
        isCollabInterested: { type: Boolean, default: false }, // The Yes/No logic
        submittedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true, // Automatically handles createdAt and updatedAt
    }
);

export const CourseIdea = model<ICourseIdea>('CourseIdea', CourseIdeaSchema);