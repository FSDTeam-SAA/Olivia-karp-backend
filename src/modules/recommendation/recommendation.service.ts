import { User } from "../user/user.model";
import Survey from "../survey/survey.model";
import Opportunity from "../oppurtunity/opportunity.model";
import Job from "../job/job.model";
import Course from "../course/course.model";
import { Event } from "../event/event.model";
import ApplyJob from "../applyJob/applyJob.model";
import EnrollCourse from "../enrollCourse/enrollCourse.model";
import {
  IRecommendationItem,
  IMemberProfileContext,
  IRecommendationResponse,
} from "./recommendation.interface";

/**
 * Builds the member's profile context from User, Survey, and Activity records.
 */
const getMemberProfileContext = async (
  userId: string,
): Promise<IMemberProfileContext> => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("Member not found");
  }

  const [survey, appliedJobs, enrolledCourses] = await Promise.all([
    Survey.findOne({ userId: user._id }).lean(),
    ApplyJob.find({ userId: user._id }).select("jobId").lean(),
    EnrollCourse.find({ userId: user._id }).select("courseId").lean(),
  ]);

  const appliedJobIds = (appliedJobs || [])
    .map((j) => j.jobId?.toString())
    .filter(Boolean);

  const enrolledCourseIds = (enrolledCourses || [])
    .map((c) => c.courseId?.toString())
    .filter(Boolean);

  return {
    userId: user._id.toString(),
    email: user.email,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Member",
    isSurveyCompleted: Boolean(user.isSurvey && survey),
    climateJourney: survey?.climateJourney || "",
    interests: Array.isArray(survey?.interest) ? survey.interest : [],
    goals: Array.isArray(survey?.goals) ? survey.goals : [],
    whatLooking: Array.isArray(survey?.whatLooking) ? survey.whatLooking : [],
    city: survey?.city || user.location || "",
    country: survey?.country || "",
    region: survey?.region || "",
    appliedJobIds,
    enrolledCourseIds,
  };
};

/**
 * Calculates a personalized relevance score (0 - 100) and rationale for an opportunity.
 */
const calculateScore = (
  item: {
    title: string;
    category: string;
    description: string;
    location: string;
    isPartner: boolean;
    createdAt?: Date | string;
    levelOrDifficulty?: string;
  },
  context: IMemberProfileContext,
): { score: number; matchReasons: string[] } => {
  let score = 25; // Base baseline score for active database content
  const matchReasons: string[] = [];

  const textToMatch = `${item.title} ${item.category} ${item.description}`.toLowerCase();
  const itemLocation = (item.location || "").toLowerCase();

  // 1. Interest Alignment (Up to 35 points)
  if (context.interests.length > 0) {
    let matchedCount = 0;
    const matchedInterestNames: string[] = [];

    for (const interest of context.interests) {
      const keyword = interest.trim().toLowerCase();
      if (!keyword) continue;

      // Check for keyword presence in title or text
      if (textToMatch.includes(keyword)) {
        matchedCount++;
        matchedInterestNames.push(interest);
      }
    }

    if (matchedCount > 0) {
      const interestPoints = Math.min(matchedCount * 18, 35);
      score += interestPoints;
      matchReasons.push(
        `Matches your interest in ${matchedInterestNames.slice(0, 2).join(" & ")}`,
      );
    }
  }

  // 2. Intent & Goals Match (Up to 20 points)
  // Check if member is looking for this category
  const itemCatLower = item.category.toLowerCase();
  const userLookingTypes = context.whatLooking.map((w) => w.toLowerCase());
  const userGoals = context.goals.map((g) => g.toLowerCase());

  let goalMatched = false;
  if (
    userLookingTypes.some((t) => t.includes(itemCatLower) || itemCatLower.includes(t)) ||
    (itemCatLower.includes("job") && userGoals.some((g) => g.includes("job") || g.includes("career"))) ||
    (itemCatLower.includes("course") && userGoals.some((g) => g.includes("skill") || g.includes("learn"))) ||
    (itemCatLower.includes("fellowship") && userGoals.some((g) => g.includes("fellowship") || g.includes("leader")))
  ) {
    score += 20;
    goalMatched = true;
    matchReasons.push(`Directly fits what you are looking for (${item.category})`);
  }

  // 3. Career Stage & Experience Fit (Up to 15 points)
  if (context.climateJourney) {
    const journeyLower = context.climateJourney.toLowerCase();
    const isBeginnerMember =
      journeyLower.includes("beginner") ||
      journeyLower.includes("starting") ||
      journeyLower.includes("new") ||
      journeyLower.includes("student");

    const isTransitionMember =
      journeyLower.includes("transition") ||
      journeyLower.includes("pivot") ||
      journeyLower.includes("mid");

    const isSeniorMember =
      journeyLower.includes("senior") ||
      journeyLower.includes("expert") ||
      journeyLower.includes("leader") ||
      journeyLower.includes("experienced");

    const isBeginnerContent =
      textToMatch.includes("beginner") ||
      textToMatch.includes("entry") ||
      textToMatch.includes("internship") ||
      textToMatch.includes("intro") ||
      textToMatch.includes("foundations");

    const isSeniorContent =
      textToMatch.includes("senior") ||
      textToMatch.includes("lead") ||
      textToMatch.includes("director") ||
      textToMatch.includes("executive") ||
      textToMatch.includes("advanced");

    if (isBeginnerMember && isBeginnerContent) {
      score += 15;
      matchReasons.push("Beginner-friendly for your career stage");
    } else if (isSeniorMember && isSeniorContent) {
      score += 15;
      matchReasons.push("Aligned with your leadership & senior background");
    } else if (isTransitionMember && (textToMatch.includes("accelerator") || textToMatch.includes("certificate") || !isSeniorContent)) {
      score += 12;
      matchReasons.push("Great fit for climate career transitioners");
    }
  }

  // 4. Location & Remote Flexibility (Up to 10 points)
  const isRemote =
    itemLocation.includes("remote") ||
    itemLocation.includes("global") ||
    itemLocation.includes("online");

  if (isRemote) {
    score += 8;
    matchReasons.push("Available remotely / online");
  } else if (
    (context.city && itemLocation.includes(context.city.toLowerCase())) ||
    (context.country && itemLocation.includes(context.country.toLowerCase()))
  ) {
    score += 10;
    matchReasons.push(`Located near you (${item.location})`);
  }

  // 5. Verified Educational Partner Boost (5 points)
  if (item.isPartner) {
    score += 5;
    matchReasons.push("From a Verified Educational Partner");
  }

  // 6. Freshness Boost (Up to 5 points)
  if (item.createdAt) {
    const createdDate = new Date(item.createdAt).getTime();
    const daysOld = (Date.now() - createdDate) / (1000 * 60 * 60 * 24);
    if (daysOld <= 14) {
      score += 5;
    }
  }

  // Cap score between 35 and 98
  const finalScore = Math.min(Math.max(score, 35), 98);

  // If no specific reasons were generated, add a default curated reason
  if (matchReasons.length === 0) {
    matchReasons.push(
      item.isPartner
        ? "Recommended partner program for climate professionals"
        : "Curated climate opportunity from platform ecosystem",
    );
  }

  return {
    score: finalScore,
    matchReasons,
  };
};

/**
 * Normalizes opportunity type into standardized category labels.
 */
const normalizeCategory = (
  rawType: string,
): "Job" | "Course" | "Fellowship" | "Event" | "Resource" | "Grant" | "Other" => {
  const t = (rawType || "").toLowerCase();
  if (t.includes("course")) return "Course";
  if (t.includes("fellowship")) return "Fellowship";
  if (t.includes("job") || t.includes("internship")) return "Job";
  if (t.includes("event") || t.includes("workshop") || t.includes("webinar")) return "Event";
  if (t.includes("grant") || t.includes("fund")) return "Grant";
  if (t.includes("resource") || t.includes("guide") || t.includes("tool")) return "Resource";
  return "Other";
};

/**
 * Generates personalized recommendations for the authenticated member.
 */
const getPersonalizedRecommendations = async (
  userId: string,
  query: { category?: string; limit?: string },
): Promise<IRecommendationResponse> => {
  // 1. Gather member context
  const context = await getMemberProfileContext(userId);

  // 2. Fetch candidate opportunities strictly from Database
  const candidateItems: IRecommendationItem[] = [];

  // A) Opportunity collection (reviewed / published)
  const oppFilter: Record<string, any> = { status: "reviewed" };
  const opps = await Opportunity.find(oppFilter)
    .populate({
      path: "partnerId",
      select: "organizationName isVerifiedPartner organizationType",
    })
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();

  for (const opp of opps) {
    const isPartner =
      Boolean(opp.isPartnerOpportunity) ||
      Boolean((opp.partnerId as any)?.isVerifiedPartner);

    const standardCategory = normalizeCategory(opp.opportunityType);

    const { score, matchReasons } = calculateScore(
      {
        title: opp.title,
        category: standardCategory,
        description: opp.shortDescription || "",
        location: opp.location || "",
        isPartner,
        createdAt: opp.createdAt,
      },
      context,
    );

    candidateItems.push({
      id: opp._id.toString(),
      title: opp.title,
      category: standardCategory,
      contentType: "opportunity",
      organization:
        opp.organizationName ||
        (opp.partnerId as any)?.organizationName ||
        "Act on Climate Partner",
      location: opp.location || "Remote",
      shortDescription: opp.shortDescription || "",
      link: opp.officialLink || `/find-your-opportunity/${opp._id}`,
      score,
      matchReasons,
      isPartner,
      createdAt: opp.createdAt,
    });
  }

  // B) Job collection (active, open, not expired, not deleted)
  const jobFilter: Record<string, any> = {
    status: "open",
    isDeleted: { $ne: true },
  };
  const jobs = await Job.find(jobFilter)
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  for (const job of jobs) {
    // Exclude if user has already applied
    if (context.appliedJobIds.includes(job._id.toString())) {
      continue;
    }

    // Exclude if deadline has passed
    if (job.deathLine && new Date(job.deathLine) < new Date()) {
      continue;
    }

    const { score, matchReasons } = calculateScore(
      {
        title: job.title,
        category: "Job",
        description: `${job.description || ""} ${job.requirement || ""}`,
        location: job.location || "",
        isPartner: false,
        createdAt: job.createdAt,
      },
      context,
    );

    const salaryText = job.salary
      ? `${job.salary.currency || "$"} ${job.salary.min} - ${job.salary.max} / ${job.salary.period}`
      : undefined;

    candidateItems.push({
      id: job._id.toString(),
      title: job.title,
      category: "Job",
      contentType: "job",
      organization: job.companyName || "Climate Employer",
      location: job.location || "Remote",
      shortDescription:
        job.description?.replace(/<[^>]*>?/gm, "").slice(0, 180) ||
        "Explore this active climate opportunity on Act on Climate.",
      link: `/find-your-opportunity/${job._id}`,
      score,
      matchReasons,
      isPartner: false,
      deadline: job.deathLine,
      salaryOrPrice: salaryText,
      createdAt: job.createdAt,
    });
  }

  // C) Course collection
  const courses = await Course.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  for (const course of courses) {
    // Exclude if user is already enrolled
    if (context.enrolledCourseIds.includes(course._id.toString())) {
      continue;
    }

    const { score, matchReasons } = calculateScore(
      {
        title: course.title,
        category: "Course",
        description: `${course.description || ""} ${course.summary || ""}`,
        location: "Online",
        isPartner: true,
        createdAt: course.createdAt,
        levelOrDifficulty: course.difficulty,
      },
      context,
    );

    candidateItems.push({
      id: course._id.toString(),
      title: course.title,
      category: "Course",
      contentType: "course",
      organization: course.instructorName || "Act on Climate Academy",
      location: "Online",
      shortDescription:
        course.summary ||
        course.description?.slice(0, 180) ||
        "Certified climate education curriculum.",
      link: course.slug ? `/courses/${course.slug}` : "/courses",
      score,
      matchReasons,
      isPartner: true,
      createdAt: course.createdAt,
    });
  }

  // D) Event collection (published events)
  const events = await Event.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  for (const ev of events) {
    const { score, matchReasons } = calculateScore(
      {
        title: ev.title || "Climate Community Event",
        category: "Event",
        description: ev.description || "",
        location: ev.location || "Online",
        isPartner: false,
        createdAt: ev.createdAt,
      },
      context,
    );

    candidateItems.push({
      id: ev._id.toString(),
      title: ev.title || "Climate Community Event",
      category: "Event",
      contentType: "event",
      organization: "Act on Climate Community",
      location: ev.location || "Online",
      shortDescription:
        ev.description?.slice(0, 180) ||
        "Connect with leaders and peers in the climate ecosystem.",
      link: ev.lumaUrl || "/event",
      score,
      matchReasons,
      isPartner: false,
      deadline: ev.eventDate,
      salaryOrPrice: ev.price ? `${ev.currency} ${ev.price}` : "Free",
      createdAt: ev.createdAt,
    });
  }

  // 3. Compute Category Stats
  const byCategory: Record<string, number> = {
    Job: 0,
    Course: 0,
    Fellowship: 0,
    Event: 0,
    Grant: 0,
    Resource: 0,
  };

  for (const item of candidateItems) {
    if (byCategory[item.category] !== undefined) {
      byCategory[item.category]++;
    }
  }

  // 4. Filter by requested category tab if specified
  let filteredItems = candidateItems;
  if (query.category && query.category.toLowerCase() !== "all") {
    const catQuery = query.category.toLowerCase();
    filteredItems = candidateItems.filter(
      (item) => item.category.toLowerCase() === catQuery,
    );
  }

  // 5. Intelligent Ranking: Sort by score descending, then by creation date descending
  filteredItems.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // 6. Apply limit
  const limitCount = Math.max(Number(query.limit) || 12, 1);
  const finalRecommendations = filteredItems.slice(0, limitCount);

  return {
    isProfileComplete: context.isSurveyCompleted,
    profileSummary: {
      name: context.name,
      climateJourney: context.climateJourney,
      interests: context.interests,
      goals: context.goals,
      whatLooking: context.whatLooking,
    },
    recommendations: finalRecommendations,
    stats: {
      totalFound: filteredItems.length,
      byCategory,
    },
  };
};

export const RecommendationService = {
  getPersonalizedRecommendations,
  getMemberProfileContext,
};
