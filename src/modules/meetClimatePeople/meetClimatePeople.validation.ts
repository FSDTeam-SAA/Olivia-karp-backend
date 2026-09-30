import { z } from "zod";

const educationItemSchema = z.union([
  z.object({
    school: z.string().optional().default(""),
    degree: z.string().optional().default(""),
    year: z.string().optional(),
  }),
  z.string(),
]);

const experienceItemSchema = z.union([
  z.object({
    title: z.string().optional().default(""),
    company: z.string().optional().default(""),
    duration: z.string().optional(),
  }),
  z.string(),
]);

const createOrUpdateMyProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    professionalTitle: z.string().optional(),
    organization: z.string().optional(),
    about: z.string().optional(),
    climateInterests: z.array(z.string()).optional(),
    professionalAreas: z.array(z.string()).optional(),
    education: z.array(educationItemSchema).optional(),
    experience: z.array(experienceItemSchema).optional(),
    skills: z.array(z.string()).optional(),
    areasOfExpertise: z.array(z.string()).optional(),
    lookingFor: z.array(z.string()).optional(),
    canHelpWith: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
    portfolio: z.string().optional(),
    profileImage: z.string().optional(),
    location: z.string().optional(),
    isVisible: z.boolean().optional(),
  }),
});

const adminCreateProfileSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string().email("Invalid email format").optional(),
    mightyMemberId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    professionalTitle: z.string().optional(),
    organization: z.string().optional(),
    about: z.string().optional(),
    climateInterests: z.array(z.string()).optional(),
    professionalAreas: z.array(z.string()).optional(),
    education: z.array(educationItemSchema).optional(),
    experience: z.array(experienceItemSchema).optional(),
    skills: z.array(z.string()).optional(),
    areasOfExpertise: z.array(z.string()).optional(),
    lookingFor: z.array(z.string()).optional(),
    canHelpWith: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
    portfolio: z.string().optional(),
    profileImage: z.string().optional(),
    location: z.string().optional(),
    isVisible: z.boolean().optional(),
  }),
});

const updateProfileVisibilitySchema = z.object({
  body: z.object({
    isVisible: z.boolean({ required_error: "isVisible boolean is required" }),
  }),
});

export const MeetClimatePeopleValidation = {
  createOrUpdateMyProfileSchema,
  adminCreateProfileSchema,
  updateProfileVisibilitySchema,
};
