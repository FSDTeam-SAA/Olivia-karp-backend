import { ILesson } from "./course.interface";
import Course from "./course.model";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

const CreateNewCourse = async (payload: any, files: { [fieldname: string]: Express.Multer.File[] }) => {
  let lessons: ILesson[] = [];

  // Parse lessons if sent as a JSON string from form-data
  if (payload.lessons) {
    lessons = typeof payload.lessons === "string" ? JSON.parse(payload.lessons) : payload.lessons;
  }

  // Handle Image Upload
  let image = { url: "", public_id: "" };
  if (files && files.image && files.image.length > 0) {
    const imageFile = files.image[0];
    image = {
      url: `/uploads/${imageFile.filename}`,
      public_id: imageFile.filename,
    };
  }

  const lessonsData = lessons.map((lesson) => ({
    title: lesson.title,
    duration: lesson.duration,
    level: lesson.level,
    videoUrl: lesson.videoUrl,
  }));

  // Calculate duration in minutes
  const totalDurationMinutes = lessonsData.reduce((total, lesson) => {
    return total + (parseInt(lesson.duration) || 0);
  }, 0);

  const courseData = {
    ...payload,
    lessons: lessonsData,
    lessonCount: lessonsData.length,
    totalDuration: `${totalDurationMinutes} min`,
    price: Number(payload.price) || 0,
    currency: payload.currency || "CAD",
    image,
  };

  const result = await Course.create(courseData);
  return result;
};

const getAllCourses = async (query: Record<string, any>) => {
  const { page = 1, limit = 10, searchTerm, category } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  // 1. Search Logic: Search in Title or Description
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // 2. Filter Logic: Match the UI Tabs from your image
  if (category && category !== "all" && category !== "All Courses") {
    /** * Logic: If the UI sends "Business Courses", we strip " Courses" 
     * to match the DB category "Business". 
     */
    const cleanCategory = category.replace(/\s*courses$/i, "").trim();
    
    filter.category = { $regex: `^${cleanCategory}$`, $options: "i" };
  }

  const data = await Course.find(filter)
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const total = await Course.countDocuments(filter);

  return {
    data,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
  };
};

const getSingleCourse = async (id: string) => {
  const result = await Course.findById(id);
  if (!result) throw new AppError("Course not found", httpStatus.NOT_FOUND);
  return result;
};


const updateCourse = async (
  id: string,
  payload: any,
  files: Record<string, Express.Multer.File[]> | undefined,
) => {
  const course = await Course.findById(id);

  if (!course) {
    throw new AppError("Course not found", httpStatus.NOT_FOUND);
  }

  let lessonsData = course.lessons;

  // 1. Properly parse and update lessons
  if (payload.lessons) {
    const lessons: ILesson[] =
      typeof payload.lessons === "string"
        ? JSON.parse(payload.lessons)
        : payload.lessons;

    if (lessons.length > 0) {
      lessonsData = lessons.map((lesson) => ({
        title: lesson.title,
        duration: lesson.duration,
        level: lesson.level,
        videoUrl: lesson.videoUrl,
      }));
    }
  }

  // 2. Handle image from Multer fields object
  let image = course.image; 
  if (files && files.image && files.image.length > 0) {
    const imageFile = files.image[0];
    image = {
      url: `/uploads/${imageFile.filename}`,
      public_id: imageFile.filename,
    };
  }

  // 3. Recalculate derived data
  const lessonCount = lessonsData.length;
  const totalMinutes = lessonsData.reduce((total, lesson) => {
    return total + (parseInt(lesson.duration) || 0);
  }, 0);

  // 4. Construct update object
  const updatedData = {
    ...payload, // Spread the rest (title, category, etc.)
    lessons: lessonsData,
    lessonCount,
    totalDuration: `${totalMinutes} min`,
    price: payload.price ? Number(payload.price) : course.price,
    image,
  };

  const result = await Course.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  return result;
};


const updateCourseAvailability = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) throw new AppError("Course not found", httpStatus.NOT_FOUND);
  
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
