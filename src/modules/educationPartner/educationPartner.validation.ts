import { z } from "zod";

const createPartnerSurveySchema = z.object({
  body: z.object({
    organizationName: z.string({
      required_error: "Organization name is required",
    }),
    organizationType: z.enum(
      [
        "university",
        "college",
        "nonprofit",
        "ngo",
        "professional_education",
        "training_organization",
        "industry_association",
        "company",
        "independent_educator",
        "other",
      ],
      {
        required_error: "Valid organization type is required",
      }
    ),
    website: z
      .string({ required_error: "Website URL is required" })
      .url("Invalid website URL format"),
    tagline: z.string().optional(),
    bio: z.string({ required_error: "Organization bio is required" }),
    areasOfExpertise: z.array(z.string()).optional().default([]),
    targetAudience: z.array(z.string()).optional().default([]),
    educationalOfferings: z.array(z.string()).optional().default([]),
    typesOfClimateEducation: z.array(z.string()).optional().default([]),
    instructorNames: z.array(z.string()).optional().default([]),
    contactEmail: z
      .string({ required_error: "Contact email is required" })
      .email("Invalid email format"),
    contactPhone: z.string().optional(),
  }),
});

const updatePartnerProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().optional(),
    organizationType: z
      .enum([
        "university",
        "college",
        "nonprofit",
        "ngo",
        "professional_education",
        "training_organization",
        "industry_association",
        "company",
        "independent_educator",
        "other",
      ])
      .optional(),
    website: z.string().url("Invalid website URL").optional(),
    tagline: z.string().optional(),
    bio: z.string().optional(),
    areasOfExpertise: z.array(z.string()).optional(),
    targetAudience: z.array(z.string()).optional(),
    educationalOfferings: z.array(z.string()).optional(),
    typesOfClimateEducation: z.array(z.string()).optional(),
    instructorNames: z.array(z.string()).optional(),
    contactEmail: z.string().email("Invalid email").optional(),
    contactPhone: z.string().optional(),
  }),
});

const createPartnerCourseSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Course title is required" }),
    category: z.string().optional().default("Beginner Courses"),
    categories: z.union([z.array(z.string()), z.string()]).optional(),
    difficulty: z.string().optional().default("Beginner"),
    durationHours: z.union([z.number(), z.string()]).optional(),
    estimatedWeeks: z.union([z.number(), z.string()]).optional(),
    price: z.union([z.number(), z.string()]).optional().default(0),
    courseBoxUrl: z.string().optional(),
    enrollmentUrl: z.string().optional(),
    instructorName: z.string().optional(),
    instructorBio: z.string().optional(),
    instructorDetails: z.string().optional(),
    lessons: z.any().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    learningOutcomes: z.union([z.array(z.string()), z.string()]).optional(),
    targetAudience: z.string().optional(),
    format: z.string().optional(),
    duration: z.string().optional(),
    isFree: z.union([z.boolean(), z.string()]).optional(),
    currency: z.string().optional().default("USD"),
    hasCertificate: z.union([z.boolean(), z.string()]).optional(),
    certificateDetails: z.string().optional(),
    prerequisites: z.string().optional(),
  }),
});

const updatePartnerCourseSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    categories: z.union([z.array(z.string()), z.string()]).optional(),
    difficulty: z.string().optional(),
    durationHours: z.union([z.number(), z.string()]).optional(),
    estimatedWeeks: z.union([z.number(), z.string()]).optional(),
    price: z.union([z.number(), z.string()]).optional(),
    courseBoxUrl: z.string().optional(),
    enrollmentUrl: z.string().optional(),
    instructorName: z.string().optional(),
    instructorBio: z.string().optional(),
    instructorDetails: z.string().optional(),
    lessons: z.any().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    learningOutcomes: z.union([z.array(z.string()), z.string()]).optional(),
    targetAudience: z.string().optional(),
    format: z.string().optional(),
    duration: z.string().optional(),
    isFree: z.union([z.boolean(), z.string()]).optional(),
    currency: z.string().optional(),
    hasCertificate: z.union([z.boolean(), z.string()]).optional(),
    certificateDetails: z.string().optional(),
    prerequisites: z.string().optional(),
    resubmit: z.union([z.boolean(), z.string()]).optional(),
  }),
});

const reviewCourseSchema = z.object({
  body: z.object({
    status: z.enum([
      "approved",
      "rejected",
      "revision_requested",
      "under_review",
      "archived",
    ]),
    adminReviewNotes: z.string().optional(),
    isFeatured: z.boolean().optional(),
    featuredOrder: z.number().optional(),
  }),
});

const checkoutMembershipSchema = z.object({
  body: z.object({
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  }),
});

const stripeConnectOnboardSchema = z.object({
  body: z.object({
    returnUrl: z.string().url().optional(),
    refreshUrl: z.string().url().optional(),
  }),
});

export const EducationPartnerValidations = {
  createPartnerSurveySchema,
  updatePartnerProfileSchema,
  createPartnerCourseSchema,
  updatePartnerCourseSchema,
  reviewCourseSchema,
  checkoutMembershipSchema,
  stripeConnectOnboardSchema,
};

