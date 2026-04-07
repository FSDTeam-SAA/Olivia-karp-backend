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

  return {
    totalCourse,
    totalAvailableCourse,
    totalUnavailableCourse,
    totalEnrollment,
  };
};

const analyticsService = {
  getCourserAnalytics,
};

export default analyticsService;
