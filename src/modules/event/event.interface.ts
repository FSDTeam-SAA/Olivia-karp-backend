import { Document } from 'mongoose';

/**
 * Interface representing the Event Entity.
 * This stores the external Luma registration link and the admin-controlled visibility status.
 */
export interface IEvent extends Document {
    /** The direct URL to the Luma event management platform [cite: 179, 180] */
    lumaUrl: string;

    /** * Admin-controlled toggle to make the event live on the website.
     * If false, the event appears in the dashboard but not on the public site.
     */
    title?: string;
    thumbnail?: string;
    description?: string;
    eventDate?: string;     // Added: e.g., "Oct 24, 2026 - 6:00 PM"
    location?: string;
    isPublished: boolean;

    /** Automatically managed by Mongoose timestamps */
    createdAt: Date;
    updatedAt: Date;
}