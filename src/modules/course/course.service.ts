import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { uploadToCloudinary } from '../../utils/cloudinary';
import EnrollCourse from '../enrollCourse/enrollCourse.model';
import { ICourse, IImage, ILesson } from './course.interface';
import Course from './course.model';
import purchaseSubscriptionService from '../purchaseSubscription/purchaseSubscription.service';

const COMPLETED_ENROLLMENT_STATUSES = ['completed', 'free'];

const getCourseDurationMinutes = (lessons: ILesson[] = []) =>
  lessons.reduce((total, lesson) => {
    const duration = Number.parseInt(String(lesson.duration || '0'), 10);
    return total + (Number.isNaN(duration) ? 0 : duration);
  }, 0);

const formatCourseDuration = (minutes: number, fallbackHours?: number) => {
  if (minutes > 0) {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes} min`;
  }

  if (fallbackHours && fallbackHours > 0) {
    return `${fallbackHours}h`;
  }

  return '0 min';
};

const serializeCourse = (course: any) => {
  const lessons = course.lessons || [];
  return {
    ...course,
    lessonCount: lessons.length,
    totalDuration: formatCourseDuration(getCourseDurationMinutes(lessons), course.durationHours),
  };
};

const CreateNewCourse = async (
  payload: any,
  files: Record<string, Express.Multer.File[]> | undefined,
) => {
  let lessons: ILesson[] = [];

  /* ---------------- Parse Lessons ---------------- */
  if (payload.lessons) {
    lessons = typeof payload.lessons === 'string' ? JSON.parse(payload.lessons) : payload.lessons;
  }

  /* ---------------- Upload Course Image ---------------- */
  let image: IImage = { url: '', public_id: '' };

  if (files?.image?.length) {
    const imageFile = files.image[0];

    const cloudinaryResult = await uploadToCloudinary(imageFile.path, 'courses');

    image = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };
  }

  /* ---------------- Upload Instructor Image ---------------- */
  let instructorImage: IImage = { url: '', public_id: '' };

  if (files?.instructorImage?.length) {
    const instructorFile = files.instructorImage[0];

    const cloudinaryResult = await uploadToCloudinary(instructorFile.path, 'instructors');

    instructorImage = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };
  }

  /* ---------------- Normalize Lessons ---------------- */
  const lessonsData: ILesson[] = lessons.map((lesson) => ({
    title: lesson.title,
    videoUrl: lesson.videoUrl,
    duration: lesson.duration,
    level: lesson.level,
    isLocked: lesson.isLocked ?? true,
  }));

  /* ---------------- Final Course Payload ---------------- */
  const courseData: Partial<ICourse> = {
    title: payload.title,
    category: payload.category,
    difficulty: payload.difficulty,
    instructorName: payload.instructorName,
    instructorBio: payload.instructorBio,
    instructorImage,
    description: payload.description,
    durationHours: Number(payload.durationHours) || 0,
    estimatedWeeks: Number(payload.estimatedWeeks) || 0,
    lessons: lessonsData,
    image,
    price: Number(payload.price) || 0,
    currency: payload.currency || 'CAD',
    totalEnrolled: 0,
  };

  /* ---------------- Save ---------------- */
  const result = await Course.create(courseData);
  return result;
};

const getAllCourses = async (query: Record<string, any>, user?: any) => {
  const { page = 1, limit = 10, searchTerm, category, sort } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  if (user?.role !== 'admin') {
    filter.isAvailable = true;
  }

  // 1. Efficient Search: Use Text Index if searchTerm exists
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // 2. Exact Category Filter: Avoid regex for fixed categories
  if (category && !['all', 'all courses'].includes(category.toLowerCase())) {
    // Standardize: "Business Courses" -> "Business"
    const cleanCategory = category.replace(/\s*courses$/i, '').trim();

    // Exact match is much faster than regex
    filter.category = new RegExp(`^${cleanCategory}$`, 'i');
  }

  // 3. Optimized Execution: Lean queries and parallel counting
  const [data, total] = await Promise.all([
    Course.find(filter)
      .sort(sort ? sort : { createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Course.countDocuments(filter),
  ]);

  let finalData: any = data;

  if (user && user.role === 'admin') {
    finalData = data.map((course: any) => ({ ...serializeCourse(course), isLocked: false }));
  } else {
    let enrolledCourseIds: string[] = [];
    let hasFreeCourseAccess = false;

    if (user) {
      const enrollments = await EnrollCourse.find({
        userId: user._id || user.id,
        paymentStatus: { $in: COMPLETED_ENROLLMENT_STATUSES },
      });
      enrolledCourseIds = enrollments.map((e) => e.courseId.toString());

      try {
        const benefits = await purchaseSubscriptionService.getUserBenefits(
          (user._id || user.id).toString(),
        );
        if (benefits.hasActiveSubscription) {
          const accessStatus = benefits.accessLevels?.courses;
          if (accessStatus === 'free_access' || accessStatus === 'free_unlimited') {
            hasFreeCourseAccess = true;
          }
        }
      } catch (err) {
        // Log error and fallback gracefully
      }
    }

    finalData = data.map((course: any) => {
      const price = course.price || 0;
      const isEnrolled = enrolledCourseIds.includes(course._id.toString());
      const isLocked = price > 0 && !isEnrolled && !hasFreeCourseAccess;

      const lockedLessons = course.lessons
        ? course.lessons.map((lesson: any) => {
            if (isLocked) {
              return { ...lesson, videoUrl: 'LOCKED' };
            }
            return lesson;
          })
        : [];

      return {
        ...serializeCourse(course),
        lessons: lockedLessons,
        isLocked,
        isEnrolled,
      };
    });
  }

  return {
    data: finalData,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
  };
};

const getSingleCourse = async (id: string, user?: any) => {
  const result = await Course.findById(id).lean();
  if (!result) throw new AppError('Course not found', httpStatus.NOT_FOUND);

  if (!result.isAvailable && user?.role !== 'admin') {
    throw new AppError('Course is not available', httpStatus.NOT_FOUND);
  }

  let hasAccess = false;
  let isEnrolled = false;

  if (user && user.role === 'admin') {
    hasAccess = true;
  } else if (user) {
    const enrollment = await EnrollCourse.findOne({
      userId: user._id || user.id,
      courseId: id,
      paymentStatus: { $in: COMPLETED_ENROLLMENT_STATUSES },
    });
    if (enrollment) {
      hasAccess = true;
      isEnrolled = true;
    } else {
      try {
        const benefits = await purchaseSubscriptionService.getUserBenefits(
          (user._id || user.id).toString(),
        );
        if (benefits.hasActiveSubscription) {
          const accessStatus = benefits.accessLevels?.courses;
          if (accessStatus === 'free_access' || accessStatus === 'free_unlimited') {
            hasAccess = true;
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
  }

  const isLocked = !hasAccess && (result.price || 0) > 0;
  result.isLocked = isLocked;
  (result as any).isEnrolled = isEnrolled;

  if (isLocked) {
    if (result.lessons) {
      result.lessons = result.lessons.map((lesson: any) => {
        lesson.videoUrl = 'LOCKED';
        return lesson;
      });
    }
  }

  return serializeCourse(result);
};

const updateCourse = async (
  id: string,
  payload: any,
  files: Record<string, Express.Multer.File[]> | undefined,
) => {
  const course = await Course.findById(id);

  if (!course) {
    throw new AppError('Course not found', httpStatus.NOT_FOUND);
  }

  /* ---------------- Lessons Update ---------------- */
  let lessonsData: ILesson[] = course.lessons;

  if (payload.lessons) {
    const lessons: ILesson[] =
      typeof payload.lessons === 'string' ? JSON.parse(payload.lessons) : payload.lessons;

    lessonsData = lessons.map((lesson) => ({
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      level: lesson.level,
      isLocked: lesson.isLocked ?? true,
    }));
  }

  /* ---------------- Course Image Update ---------------- */
  let image = course.image;

  if (files?.image?.length) {
    const imageFile = files.image[0];

    const cloudinaryResult = await uploadToCloudinary(imageFile.path, 'courses');

    image = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };
  }

  /* ---------------- Instructor Image Update ---------------- */
  let instructorImage = course.instructorImage;

  if (files?.instructorImage?.length) {
    const instructorFile = files.instructorImage[0];

    const cloudinaryResult = await uploadToCloudinary(instructorFile.path, 'instructors');

    instructorImage = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };
  }

  /* ---------------- Final Payload ---------------- */
  const updatedData: Partial<ICourse> = {
    ...payload,

    lessons: lessonsData,

    image,
    instructorImage,

    durationHours: payload.durationHours ? Number(payload.durationHours) : course.durationHours,

    estimatedWeeks: payload.estimatedWeeks ? Number(payload.estimatedWeeks) : course.estimatedWeeks,

    price: payload.price ? Number(payload.price) : course.price,

    isLocked:
      payload.isLocked !== undefined
        ? payload.isLocked === 'true' || payload.isLocked === true
        : course.isLocked,

    isAvailable:
      payload.isAvailable !== undefined
        ? payload.isAvailable === 'true' || payload.isAvailable === true
        : course.isAvailable,
  };

  /* ---------------- Update DB ---------------- */
  const result = await Course.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const updateCourseAvailability = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) throw new AppError('Course not found', httpStatus.NOT_FOUND);

  return await Course.findByIdAndUpdate(id, { isAvailable: !course.isAvailable }, { new: true });
};

const courseService = {
  CreateNewCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  updateCourseAvailability,
};
export default courseService;
