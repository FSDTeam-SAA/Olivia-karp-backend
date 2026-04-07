import Course from "../course/course.model";
import { User } from "../user/user.model";
import { IEnrollCourse } from "./enrollCourse.interface";
import EnrollCourse from "./enrollCourse.model";

const createEnrollCourse = async (payload: IEnrollCourse, email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No account found with the provided credentials.");
  }

  const course = await Course.findById(payload.courseId);
  if (!course) {
    throw new Error("Course not found.");
  }

  const result = await EnrollCourse.create({
    userId: user._id,
    courseId: course._id,
  });
  return result;
};

const enrollCourseService = {
  createEnrollCourse,
};

export default enrollCourseService;
