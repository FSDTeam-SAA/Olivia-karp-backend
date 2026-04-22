import { z } from 'zod';

const createMediaValidationSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }),
        mediaType: z.enum(['url', 'audio', 'files']),
        category: z.enum([
            'video',
            'podcast',
            'event-recording',
            'expert-interview',
            'insight',
            'blog',
            'resource'
        ]),
        contentUrl: z.string().optional(),
        description: z.string({ required_error: 'Description is required' }),
        thumbnailImage: z.string().optional(),
        isPublished: z.boolean().default(false),
        isFeatured: z.boolean().default(false),
    }),
});

const updateMediaValidationSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        mediaType: z.enum(['url', 'audio', 'files']).optional(),
        category: z.enum([
            'video', 'podcast', 'event-recording',
            'expert-interview', 'insight', 'blog', 'resource'
        ]).optional(),
        contentUrl: z.string().optional(),
        description: z.string().optional(),
        thumbnailImage: z.string().optional(),
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
    }),
});

export const MediaValidation = {
    createMediaValidationSchema,
    updateMediaValidationSchema,
};