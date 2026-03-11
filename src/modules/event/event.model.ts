import { Schema, model, Document } from 'mongoose';
import { IEvent } from './event.interface';

// Interface for type safety
// export interface IEvent extends Document {
//     lumaUrl: string;
//     isPublished: boolean;
// }

const eventSchema = new Schema<IEvent>(
    {
        // The link provided in your Figma/Screenshot [cite: 180, 181]
        lumaUrl: {
            type: String,
            required: true,
            unique: true, // Prevents duplicate entries of the same event
            trim: true,
            // validate: {
            //     validator: (v: string) => v.startsWith('https://lu.ma/'),
            //     message: 'A valid Luma event link is required.'
            // }
        },
        title: { type: String },
        thumbnail: { type: String },
        description: { type: String },
        eventDate: { type: String }, // New field
        location: { type: String },  // New field
        // Admin toggle to control visibility on the actonclimate.ca site [cite: 187]
        isPublished: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true, // Tracks when the link was added/updated
    }
);

export const Event = model<IEvent>('Event', eventSchema);