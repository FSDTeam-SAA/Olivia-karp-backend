import { z } from 'zod';

const blogCategories = [
    'Expert Insights',
    'Climate Careers',
    'Research',
    'Toolkit',
    'Renewable Energy',
] as const;

const createBlogValidationSchema = z.object({
    body: z.object({
        title: z.string().trim().optional(),
        category: z.enum(blogCategories).optional(),
        content: z.string().optional(),
        author: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            profileImage: z.string().optional(),
        }).optional(),
        thumbnailImage: z.string().optional(),
        isPublished: z.boolean().optional().default(false),
        isFeatured: z.boolean().optional().default(false),
    }),
});

const updateBlogValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    thumbnailImage: z.string().optional(),
    author: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      profileImage: z.string().optional()
    }).optional()
  })
});

export const BlogValidations = {
    createBlogValidationSchema,
    updateBlogValidationSchema,
};