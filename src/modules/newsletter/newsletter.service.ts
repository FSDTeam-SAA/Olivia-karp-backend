import axios from 'axios';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { Newsletter } from './newsletter.model';
import { INewsletter } from './newsletter.interface';

const subscribeUser = async (email: string): Promise<INewsletter> => {
    // 1. Check if they already exist in your DB
    const existing = await Newsletter.findOne({ email });
    if (existing) {
        throw new AppError('You are already subscribed!', httpStatus.BAD_REQUEST);
    }

    // 2. Save to your MongoDB first (Local Data Ownership)
    // Use the model to create the document
    const result = await Newsletter.create({ email });

    // 3. Sync to Beehiiv V2
    try {
        await axios.post(
            `https://api.beehiiv.com/v2/publications/${config.beehiiv.beehiiv_publication_id}/subscriptions`,
            {
                email,
                send_welcome_email: true,
                double_opt_override: "off",
                utm_source: "ActOnClimate_Website",
                utm_medium: "organic"
            },
            {
                headers: {
                    Authorization: `Bearer ${config.beehiiv.beehiiv_api_key}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // 4. If Sync works, update the local DB AND the local object
        // We use .set() and .save() to avoid the type casting issues of findByIdAndUpdate
        result.isSynced = true;
        await result.save();

    } catch (error: any) {
        // Log the error for the Admin but don't fail the user request
        console.error('Beehiiv Sync Error:', error.response?.data || error.message);
    }

    // 5. Return the updated result (will now show true in Postman)
    return result;
};

// For your Admin Dashboard Table
const getAllSubscribers = async () => {
    return await Newsletter.find().sort({ createdAt: -1 });
};


/**
 * 2. Get Dashboard Stats (New Plan Addition)
 */
const getSubscriberStats = async () => {
    const total = await Newsletter.countDocuments();
    const synced = await Newsletter.countDocuments({ isSynced: true });
    const unsynced = total - synced;

    // Growth in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentGrowth = await Newsletter.countDocuments({
        createdAt: { $gte: yesterday }
    });

    return {
        total,
        synced,
        unsynced,
        recentGrowth,
        syncHealth: total > 0 ? (synced / total) * 100 : 100
    };
};

/**
 * 3. Bulk Sync / Retry (The "Lead Engineer" Fail-safe)
 */
const syncUnsyncedSubscribers = async () => {
    const unsyncedUsers = await Newsletter.find({ isSynced: false });

    for (const user of unsyncedUsers) {
        try {
            await axios.post(
                `https://api.beehiiv.com/v2/publications/${config.beehiiv.beehiiv_publication_id}/subscriptions`,
                { email: user.email },
                {
                    headers: { Authorization: `Bearer ${config.beehiiv.beehiiv_api_key}` }
                }
            );
            await Newsletter.findByIdAndUpdate(user._id, { isSynced: true });
        } catch (err) {
            console.error(`Failed to re-sync ${user.email}`);
        }
    }

    return { message: `Attempted sync for ${unsyncedUsers.length} users.` };
};

export const NewsletterService = {
    subscribeUser,
    getAllSubscribers,
    getSubscriberStats,
    syncUnsyncedSubscribers

};