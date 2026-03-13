import { ICourseIdea } from "./course.interface";
import { CourseIdea } from "./course.model";

const submitIdeaIntoDB = async (payload: ICourseIdea) => {
    const result = await CourseIdea.create(payload);
    return result;
};

const getAllIdeasForAdmin = async () => {
    const result = await CourseIdea.find()
        .populate('submittedBy', 'name email image') // Only fetch these fields from User
        .sort('-createdAt');
    return result;
};

export const CourseIdeaServices = {
    submitIdeaIntoDB,
    getAllIdeasForAdmin,

};