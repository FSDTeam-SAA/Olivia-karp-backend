import { User } from "../user/user.model";
import { ISurvey } from "./survey.interface";
import Survey from "./survey.model";

const createNewSurvey = async (payload: ISurvey, email: string) => {
  const user = await User.findOne({ email }).select("_id isSurvey");

  if (!user) {
    throw new Error("No account found with the provided credentials.");
  }

  // Optional: prevent multiple submissions (extra safety)
  if (user.isSurvey) {
    throw new Error("You have already submitted the survey.");
  }

  try {
    const result = await Survey.create({
      ...payload,
      userId: user._id,
    });

    //  Update user isSurvey = true
    await User.findByIdAndUpdate(user._id, {
      isSurvey: true,
    });

    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("You have already applied for a survey.");
    }
    throw error;
  }
};

const getAllSurveys = async (query: any) => {
  // ---------- Pagination ----------
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // ---------- Search & Filter ----------
  const filter: any = {};

  // Search by name (case-insensitive)
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  // Filter by region
  if (query.region) {
    filter.region = query.region;
  }

  // ---------- Query ----------
  const [data, total] = await Promise.all([
    Survey.find(filter)
      .populate("userId", "firstName lastName email image")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .lean(),

    Survey.countDocuments(filter),
  ]);

  // ---------- Meta ----------
  const meta = {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };

  return { meta, data };
};

const getSingleSurvey = async (id: string) => {
  const result = await Survey.findById(id).populate(
    "userId",
    "firstName lastName email image",
  );
  return result;
};

const SurveyService = {
  createNewSurvey,
  getAllSurveys,
  getSingleSurvey,
};

export default SurveyService;
