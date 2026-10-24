export interface IRecommendationItem {
  id: string;
  title: string;
  category: "Job" | "Course" | "Fellowship" | "Event" | "Resource" | "Grant" | "Other";
  contentType: "opportunity" | "job" | "course" | "event";
  organization: string;
  location: string;
  shortDescription: string;
  link: string;
  score: number; // 0 - 100
  matchReasons: string[];
  isPartner: boolean;
  deadline?: string | Date;
  salaryOrPrice?: string;
  createdAt?: string | Date;
}

export interface IMemberProfileContext {
  userId: string;
  email: string;
  name: string;
  isSurveyCompleted: boolean;
  climateJourney?: string; // career stage (beginner, intermediate, advanced)
  interests: string[];
  goals: string[];
  whatLooking: string[];
  city?: string;
  country?: string;
  region?: string;
  appliedJobIds: string[];
  enrolledCourseIds: string[];
}

export interface IRecommendationResponse {
  isProfileComplete: boolean;
  profileSummary: {
    name: string;
    climateJourney?: string;
    interests: string[];
    goals: string[];
    whatLooking: string[];
  };
  recommendations: IRecommendationItem[];
  stats: {
    totalFound: number;
    byCategory: Record<string, number>;
  };
}

