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
    summary: z.string({ required_error: "Course summary is required" }),
    description: z.string({ required_error: "Course description is required" }),
    learningOutcomes: z
      .array(z.string())
      .min(1, "At least one learning outcome is required"),
    targetAudience: z.string({
      required_error: "Target audience description is required",
    }),
    instructorDetails: z.string().optional(),
    categories: z
      .array(z.string())
      .min(1, "At least one climate category is required"),
    format: z.enum(
      [
        "online_self_paced",
        "online_cohort",
        "in_person",
        "hybrid",
        "workshop",
        "short_course",
        "certificate_program",
      ],
      { required_error: "Course format is required" }
    ),
    duration: z.string({ required_error: "Duration is required" }),
    isFree: z.boolean().optional().default(false),
    price: z.number().optional().default(0),
    currency: z.string().optional().default("USD"),
    hasCertificate: z.boolean().optional().default(false),
    certificateDetails: z.string().optional(),
    prerequisites: z.string().optional(),
    enrollmentUrl: z
      .string({ required_error: "Direct enrollment URL is required" })
      .url("Invalid enrollment URL"),
  }),
});

const updatePartnerCourseSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    learningOutcomes: z.array(z.string()).optional(),
    targetAudience: z.string().optional(),
    instructorDetails: z.string().optional(),
    categories: z.array(z.string()).optional(),
    format: z
      .enum([
        "online_self_paced",
        "online_cohort",
        "in_person",
        "hybrid",
        "workshop",
        "short_course",
        "certificate_program",
      ])
      .optional(),
    duration: z.string().optional(),
    isFree: z.boolean().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    hasCertificate: z.boolean().optional(),
    certificateDetails: z.string().optional(),
    prerequisites: z.string().optional(),
    enrollmentUrl: z.string().url("Invalid enrollment URL").optional(),
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

