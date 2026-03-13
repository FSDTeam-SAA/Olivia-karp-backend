import { z } from 'zod';

const createCourseIdeaValidationSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title is too short").optional(),
        category: z.string().optional(),
        skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
        description: z.string().min(20, "Please provide more detail").optional(),
        keyTopics: z.array(z.string()).nonempty("Add at least one topic").optional(),
        whoIsThisCourseFor: z.string().optional(),
        yourName: z.string().optional(),
        yourEmail: z.string().email("Invalid email format").optional(),
        isCollabInterested: z.boolean().optional(), // Validates the Yes/No
    }),
});

export const CourseIdeaValidations = {
    createCourseIdeaValidationSchema,
};