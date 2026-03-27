import { User } from "../user/user.model";
import { ISurvey } from "./survey.interface";
import Survey from "./survey.model";

const createNewSurvey = async (payload: ISurvey, email: string) => {
  const user = await User.findOne({ email }).select("_id").lean();

  if (!user) {
    throw new Error("No account found with the provided credentials.");
  }

  try {
    const result = await Survey.create({
      ...payload,
      userId: user._id,
    });

    return result;
  } catch (error: any) {
    // Handle duplicate submission (from unique index)
    if (error.code === 11000) {
      throw new Error("You have already applied for a survey.");
    }
    throw error;
  }
};

const SurveyService = {
  createNewSurvey,
};

export default SurveyService;
