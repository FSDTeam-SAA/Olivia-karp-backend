import { z } from 'zod';

const blogCategories = [
    'Expert Insights',
    'Climate Careers',
    'Research',
    'Toolkit',
    'Community',
] as const;

// FormData serializes booleans as strings; JSON requests retain real booleans.
const booleanFromRequest = z.preprocess(
    (value) => value === 'true' ? true : value === 'false' ? false : value,
    z.boolean(),
);

const createBlogValidationSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).optional(),
        category: z.enum(blogCategories),
        content: z.string().min(1).optional(),
        author: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            profileImage: z.string().optional(),
        }).optional(),
        thumbnailImage: z.string().optional(),
        isPublished: booleanFromRequest.optional().default(false),
        isFeatured: booleanFromRequest.optional().default(false),
    }),
});

const updateBlogValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    category: z.enum(blogCategories).optional(),
    content: z.string().optional(),
    thumbnailImage: z.string().optional(),
    author: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      profileImage: z.string().optional()
    }).optional(),
    isPublished: booleanFromRequest.optional(),
    isFeatured: booleanFromRequest.optional(),
  })
});

export const BlogValidations = {
    createBlogValidationSchema,
    updateBlogValidationSchema,
};
