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
        title: z.string({ required_error: 'Title is required' }).trim(),
        category: z.enum(blogCategories, {
            required_error: 'Category is required',
        }),
        content: z.string({ required_error: 'Blog content is required' }),
        author: z.object({
            name: z.string({ required_error: 'Author name is required' }),
            description: z.string({ required_error: 'Author description is required' }),
            profileImage: z.string().optional(), // Allow it to be missing initially
        }),
        thumbnailImage: z.string().optional(), // Allow it to be missing initially
        isPublished: z.boolean().default(false),
        isFeatured: z.boolean().default(false),
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