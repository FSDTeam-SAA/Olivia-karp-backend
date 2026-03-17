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

const courseService = {
  CreateNewCourse,
};
export default courseService;
