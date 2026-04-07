import Course from "../course/course.model";
import EnrollCourse from "../enrollCourse/enrollCourse.model";

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

const analyticsService = {
  getCourserAnalytics,
};

export default analyticsService;
