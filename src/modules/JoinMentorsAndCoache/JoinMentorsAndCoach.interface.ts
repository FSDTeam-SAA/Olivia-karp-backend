export interface IJoinMentorsAndCoach {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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
  availability?: string;
  linkedin?: string;
  website?: string;
  totalSessions?: number;
  isActive?: boolean;
  isApproved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
