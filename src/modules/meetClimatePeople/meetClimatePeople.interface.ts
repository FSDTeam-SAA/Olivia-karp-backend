export interface IEducationItem {
  school: string;
  degree: string;
  year?: string;
}

export interface IExperienceItem {
  title: string;
  company: string;
  duration?: string;
}

export interface IMeetClimateProfile {
  mightyMemberId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string; // internal, excluded from public responses
  professionalTitle: string;
  organization: string;
  about: string;
  climateInterests: string[];
  professionalAreas: string[];
  education: IEducationItem[] | string[];
  experience: IExperienceItem[] | string[];
  skills: string[];
  areasOfExpertise: string[];
  lookingFor: string[];
  canHelpWith: string[];
  linkedin?: string;
  website?: string;
  portfolio?: string;
  profileImage?: string;
  location?: string;
  mightyPermalink?: string;
  isVisible: boolean;
  syncStatus: "synced" | "manual" | "pending";
  lastSyncedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProfileQueryParams {
  search?: string;
  climateInterest?: string;
  professionalArea?: string;
  lookingFor?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  all?: string | boolean;
}
