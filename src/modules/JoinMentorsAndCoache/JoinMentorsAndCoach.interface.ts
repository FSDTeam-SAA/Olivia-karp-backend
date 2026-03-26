import { Types } from "mongoose";

export interface IJoinMentorsAndCoach {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  designation?: string;
  bio: string;
  about: string;
  image: {
    url: string;
    public_id: string;
  };
  type: "mentor" | "coach";
  skills: string[];
  support: {
    title: string;
    description: string;
  }[];
  experience: {
    title: string;
    description: string;
  }[];
  languages: string[];
  experienceYears: number;
  linkedin?: string;
  website?: string;
  isPaidSession: boolean;
  hourlyRate?: number;
  bookingLink: string;
  motivation: string;
  goal: string;
  isApproved: boolean;
  isActive: boolean;
  totalSessions?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
