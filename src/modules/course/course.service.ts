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
    isLocked: lesson.isLocked ?? false,
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
    lessons: lessonsData,
    lessonsCount,
    totalDuration: `${totalDuration} min`,
    isLocked: payload.isLocked ?? false,
    image,
  };

  const result = await Course.create(courseData);
  return result;
};

const getAllCourses = async (query: any) => {
  const { page = 1, limit = 10, searchTerm } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  // search by title (case insensitive)
  if (searchTerm && searchTerm.trim() !== "") {
    filter.$or = [
      {
        title: {
          $regex: searchTerm.trim(),
          $options: "i", // makes search case-insensitive
        },
      },
    ];
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

const courseService = {
  CreateNewCourse,
  getAllCourses,
  getSingleCourse,
};
export default courseService;
