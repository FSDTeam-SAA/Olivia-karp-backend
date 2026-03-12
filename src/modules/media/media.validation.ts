import { z } from 'zod';

const createMediaValidationSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }),
        mediaType: z.enum([
            'video',
            'podcast',
            'event-recording',
            'expert-interview',
            'insight',
            'blog',
            'resource'
        ]),
        sourceType: z.enum(['URL', 'FILE']),
        contentUrl: z.string({ required_error: 'Content URL is required' }),
        description: z.string({ required_error: 'Description is required' }),
        thumbnailImage: z.string().optional(), // Optional because our service handles YouTube auto-gen
        isPublished: z.boolean().default(false),
        isFeatured: z.boolean().default(false),
    }),
});

const updateMediaValidationSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        mediaType: z.enum([
            'video',
            'podcast',
            'event-recording',
            'expert-interview',
            'insight',
            'blog',
            'resource'
        ]).optional(),
        sourceType: z.enum(['URL', 'FILE']).optional(),
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