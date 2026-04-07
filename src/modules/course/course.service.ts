import { ILesson } from "./course.interface";
import Course from "./course.model";

const CreateNewCourse = async (payload: any, files: Express.Multer.File[]) => {
  let lessons: ILesson[] = [];

  // parse lessons if sent as string
  if (payload.lessons) {
    lessons =
      typeof payload.lessons === "string"
        ? JSON.parse(payload.lessons)
        : payload.lessons;
  }

  // course image
  let image = {};
  if (files && files.length > 0) {
    const imageFile = files[0];

    image = {
      url: `/uploads/${imageFile.filename}`,
      public_id: imageFile.filename,
    };
  }

  // lessons already contain videoUrl
  const lessonsData = lessons.map((lesson) => ({
    title: lesson.title,
    duration: lesson.duration,
    level: lesson.level,
    videoUrl: lesson.videoUrl, // directly from payload
  }));

  const lessonsCount = lessonsData.length;

  // calculate duration
  const totalDuration = lessonsData.reduce((total, lesson) => {
    const minutes = parseInt(lesson.duration) || 0;
    return total + minutes;
  }, 0);

  const courseData = {
    id: payload.id,
    title: payload.title,
    category: payload.category, // added category
    lessons: lessonsData,
    lessonsCount,
    totalDuration: `${totalDuration} min`,
    price: Number(payload.price) || 0,
    currency: payload.currency || "CAD",
    image,
  };

  const result = await Course.create(courseData);
  return result;
};

const getAllCourses = async (query: any) => {
  const { page = 1, limit = 10, searchTerm, category } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  // search by title (case insensitive)
  if (searchTerm && searchTerm.trim() !== "") {
    filter.title = {
      $regex: searchTerm.trim(),
      $options: "i",
    };
  }

  // filter by category
  if (category && category.trim() !== "") {
    const categoryLower = category.trim().toLowerCase();

    // ignore filter if category is "all" or "all courses"
    if (categoryLower !== "all" && categoryLower !== "all courses") {
      // clean suffix " courses" from labels like "Business Courses"
      const cleanCategory = category.trim().replace(/\s*courses$/i, "");

      filter.category = {
        $regex: cleanCategory,
        $options: "i",
      };
    }
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
  if (!result) {
    throw new Error("Course not found");
  }

  return result;
};

const updateCourse = async (
  id: string,
  payload: any,
  files: Express.Multer.File[],
) => {
  const course = await Course.findById(id);

  if (!course) {
    throw new Error("Course not found");
  }

  let lessons: ILesson[] = [];

  // parse lessons (string or array)
  if (payload.lessons) {
    lessons =
      typeof payload.lessons === "string"
        ? JSON.parse(payload.lessons)
        : payload.lessons;
  }

  // update image (if new file uploaded)
  let image = course.image; // default old image

  if (files && files.length > 0) {
    const imageFile = files[0];

    image = {
      url: `/uploads/${imageFile.filename}`,
      public_id: imageFile.filename,
    };
  }

  // update lessons
  let lessonsData = course.lessons;

  if (lessons.length > 0) {
    lessonsData = lessons.map((lesson) => ({
      title: lesson.title,
      duration: lesson.duration,
      level: lesson.level,
      videoUrl: lesson.videoUrl,
    }));
  }

  const lessonsCount = lessonsData.length;

  // calculate total duration
  const totalDuration = lessonsData.reduce((total, lesson) => {
    const minutes = parseInt(lesson.duration) || 0;
    return total + minutes;
  }, 0);

  // update object
  const updatedData = {
    title: payload.title ?? course.title,
    category: payload.category ?? course.category,
    lessons: lessonsData,
    lessonsCount,
    totalDuration: `${totalDuration} min`,
    price: payload.price ? Number(payload.price) : course.price,
    currency: payload.currency ?? course.currency,
    image,
  };

  const result = await Course.findByIdAndUpdate(id, updatedData, {
    new: true,
  });

  return result;
};

const updateCourseAvailability = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new Error("Course not found");
  }

  const updatedData = {
    isAvailable: !course.isAvailable,
  };

  await Course.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
};

const courseService = {
  CreateNewCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  updateCourseAvailability,
};
export default courseService;
