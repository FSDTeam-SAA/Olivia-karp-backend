import { Schema, model } from 'mongoose';
import { INewsletter } from './newsletter.interface';

const newsletterSchema = new Schema<INewsletter>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        isSynced: {
            type: Boolean,
            default: false,
        },
        subscriptionSource: {
            type: String,
            default: 'website_footer',
        },
    },
    { timestamps: true },
);

export const Newsletter = model<INewsletter>('Newsletter', newsletterSchema);