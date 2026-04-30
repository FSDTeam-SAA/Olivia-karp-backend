import { ApplyBlog } from "../applyBlog/applyBlog.model";
import Course from "../course/course.model";
import { CourseIdea } from "../courseIdea/courseIdea.model";
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

const chatAnalytics = async (query: any) => {
  const type = query.type || "monthly";
  const selectedYear = Number(query.year) || new Date().getFullYear();

  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  let groupStage: any;


  if (type === "weekly") {
    startDate = new Date(selectedYear, 0, 1); // Jan 1
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999); // Dec 31

    groupStage = {
      day: { $dayOfWeek: "$createdAt" },
    };
  }

  // ===============================
  // YEARLY
  // ===============================
  else if (type === "yearly") {
    startDate = new Date(selectedYear - 5, 0, 1);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    groupStage = {
      year: { $year: "$createdAt" },
    };
  }

  // ===============================
  // MONTHLY
  // ===============================
  else {
    startDate = new Date(selectedYear, 0, 1);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    groupStage = {
      month: { $month: "$createdAt" },
    };
  }

  // যদি future year হয়
  if (selectedYear > now.getFullYear()) {
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
  }

  const rawData = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: groupStage,
        totalUser: { $sum: 1 },
      },
    },
  ]);

  const result: any = {};

  // ===============================
  // WEEKLY
  // ===============================
  if (type === "weekly") {
    const weekMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    weekMap.forEach((day, index) => {
      const found = rawData.find((d: any) => d._id.day === index + 1);

      result[day] = {
        totalUser: found ? found.totalUser : 0,
      };
    });
  }

  // ===============================
  // MONTHLY
  // ===============================
  else if (type === "monthly") {
    const monthMap = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    monthMap.forEach((month, index) => {
      const found = rawData.find((d: any) => d._id.month === index + 1);

      result[month] = {
        totalUser: found ? found.totalUser : 0,
        year: selectedYear,
      };
    });
  }

  // ===============================
  // YEARLY
  // ===============================
  else if (type === "yearly") {
    for (let year = selectedYear - 5; year <= selectedYear; year++) {
      const found = rawData.find((d: any) => d._id.year === year);

      result[year] = {
        totalUser: found ? found.totalUser : 0,
      };
    }
  }

  return {
    type,
    year: selectedYear,
    data: result,
  };
};


const recentActivity = async () => {
  const limitPerCollection = 10;

  const [blogs, courseIdeas, jobs] = await Promise.all([
    ApplyBlog.find({
      status: { $regex: /^pending$/i },
    })
      .sort({ createdAt: -1 })
      .limit(limitPerCollection)
      .populate("user", "fullName firstName lastName name")
      .lean(),


    CourseIdea.find({
      status: { $regex: /^pending$/i },
    })
      .sort({ createdAt: -1 })
      .limit(limitPerCollection)
      .populate("submittedBy", "fullName firstName lastName name")
      .lean(),

    JoinMentorCoach.find({
      isApproved: false,
    })
      .sort({ createdAt: -1 })
      .limit(limitPerCollection)
      .lean(),
  ]);

  const blogActivities = blogs.map((item: any) => ({
    _id: item._id,
    title: item.title,
    type: "Blog",
    submittedBy:
      item.user?.fullName ||
      item.user?.name ||
      `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim() ||
      "Unknown User",
    date: item.createdAt,
    status: "Pending",
  }));

  const courseActivities = courseIdeas.map((item: any) => ({
    _id: item._id,
    title: item.title,
    type: "Course",
    submittedBy:
      item.submittedBy?.fullName ||
      item.submittedBy?.name ||
      `${item.submittedBy?.firstName || ""} ${
        item.submittedBy?.lastName || ""
      }`.trim() ||
      item.yourName ||
      "Unknown User",
    date: item.createdAt,
    status: "Pending",
  }));

  const jobActivities = jobs.map((item: any) => ({
    _id: item._id,
    title: `${item.type === "mentor" ? "Mentor" : "Coach"} Application`,
    type: "Job",
    submittedBy: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
    date: item.createdAt,
    status: "Pending",
  }));


  const merged = [
    ...blogActivities,
    ...courseActivities,
    ...jobActivities,
  ].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return merged.slice(0, 5);
};



const analyticsService = {
  getCourserAnalytics,
  dashboardAnalytics,
  chatAnalytics,
  recentActivity,
};

export default analyticsService;
