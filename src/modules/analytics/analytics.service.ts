import Course from "../course/course.model";
import EnrollCourse from "../enrollCourse/enrollCourse.model";
import Job from "../job/job.model";
import JoinMentorCoach from "../JoinMentorsAndCoache/JoinMentorsAndCoach.model";
import PurchaseSubscription from "../purchaseSubscription/purchaseSubscription.model";
import { User } from "../user/user.model";

const getCourserAnalytics = async () => {
  const totalCourse = await Course.countDocuments();

  const totalAvailableCourse = await Course.countDocuments({
    isAvailable: true,
  });

  const totalUnavailableCourse = await Course.countDocuments({
    isAvailable: false,
  });

  const totalEnrollment = await EnrollCourse.countDocuments();

  // 📅 Date calculation
  const now = new Date();

  const last30Days = new Date();
  last30Days.setDate(now.getDate() - 30);

  const prev30Days = new Date();
  prev30Days.setDate(now.getDate() - 60);

  // 🔥 current enrollments (last 30 days)
  const currentEnrollments = await EnrollCourse.countDocuments({
    createdAt: { $gte: last30Days },
  });

  // 🔥 previous enrollments (30-60 days ago)
  const previousEnrollments = await EnrollCourse.countDocuments({
    createdAt: {
      $gte: prev30Days,
      $lt: last30Days,
    },
  });

  // 📊 growth calculation
  let growth = 0;

  if (previousEnrollments > 0) {
    growth =
      ((currentEnrollments - previousEnrollments) / previousEnrollments) * 100;
  }

  return {
    totalCourse,
    totalAvailableCourse,
    totalUnavailableCourse,
    totalEnrollment,
    enrollmentGrowth: Math.round(growth), // 👉 +36
  };
};

const dashboardAnalytics = async () => {
  const now = new Date();

  // 🔹 Last 7 days
  const last7DaysStart = new Date();
  last7DaysStart.setDate(now.getDate() - 7);

  // 🔹 Previous 7 days
  const prev7DaysStart = new Date();
  prev7DaysStart.setDate(now.getDate() - 14);

  const prev7DaysEnd = new Date();
  prev7DaysEnd.setDate(now.getDate() - 7);

  // =========================
  // 🔹 TOTAL COUNTS
  // =========================

  const totalMember = await User.countDocuments();

  const totalSubscribedUser = await PurchaseSubscription.countDocuments({
    expirationDate: { $gte: now }, // active subscription
  });

  const totalMentorAndCoach = await JoinMentorCoach.countDocuments({
    isApproved: true,
  });

  const totalJobs = await Job.countDocuments();

  // =========================
  // 🔥 GROWTH CALCULATION
  // =========================

  // 🔹 Member Growth
  const currentMember = await User.countDocuments({
    createdAt: { $gte: last7DaysStart, $lte: now },
  });

  const previousMember = await User.countDocuments({
    createdAt: { $gte: prev7DaysStart, $lte: prev7DaysEnd },
  });

  const memberGrowth =
    previousMember === 0
      ? currentMember > 0
        ? 100
        : 0
      : ((currentMember - previousMember) / previousMember) * 100;

  // 🔹 Subscription Growth
  const currentSubscription = await PurchaseSubscription.countDocuments({
    purchaseDate: { $gte: last7DaysStart, $lte: now },
  });

  const previousSubscription = await PurchaseSubscription.countDocuments({
    purchaseDate: { $gte: prev7DaysStart, $lte: prev7DaysEnd },
  });

  const subscriptionGrowth =
    previousSubscription === 0
      ? currentSubscription > 0
        ? 100
        : 0
      : ((currentSubscription - previousSubscription) / previousSubscription) *
        100;

  // 🔹 Mentor Growth
  const currentMentor = await JoinMentorCoach.countDocuments({
    isApproved: true,
    createdAt: { $gte: last7DaysStart, $lte: now },
  });

  const previousMentor = await JoinMentorCoach.countDocuments({
    isApproved: true,
    createdAt: { $gte: prev7DaysStart, $lte: prev7DaysEnd },
  });

  const mentorGrowth =
    previousMentor === 0
      ? currentMentor > 0
        ? 100
        : 0
      : ((currentMentor - previousMentor) / previousMentor) * 100;

  // 🔹 Job Growth
  const currentJobs = await Job.countDocuments({
    createdAt: { $gte: last7DaysStart, $lte: now },
  });

  const previousJobs = await Job.countDocuments({
    createdAt: { $gte: prev7DaysStart, $lte: prev7DaysEnd },
  });

  const jobGrowth =
    previousJobs === 0
      ? currentJobs > 0
        ? 100
        : 0
      : ((currentJobs - previousJobs) / previousJobs) * 100;

  // =========================
  // 🎯 FINAL RESPONSE
  // =========================

  return {
    analytics: {
      members: {
        total: totalMember,
        growth: Number(memberGrowth.toFixed(0)),
      },
      subscriptions: {
        total: totalSubscribedUser,
        growth: Number(subscriptionGrowth.toFixed(0)),
      },
      mentors: {
        total: totalMentorAndCoach,
        growth: Number(mentorGrowth.toFixed(0)),
      },
      jobs: {
        total: totalJobs,
        growth: Number(jobGrowth.toFixed(0)),
      },
    },
  };
};

const analyticsService = {
  getCourserAnalytics,
  dashboardAnalytics,
};

export default analyticsService;
