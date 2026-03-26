import AppError from "../../errors/AppError";
import { Event } from "../event/event.model";
import { User } from "../user/user.model";
import { ISpeaker } from "./speaker.interface";
import Speaker from "./speaker.model";

//! Who can apply for speaker? Who registered for event?
//! Only for who subscribed or member only.

const applyForSpeaker = async (email: string, payload: ISpeaker) => {
  // run queries in parallel
  const [user, event] = await Promise.all([
    User.findOne({ email }).select("_id").lean(),
    Event.findById(payload.eventId).select("_id").lean(),
  ]);

  if (!user) {
    throw new AppError("No account found with the provided credentials.", 404);
  }

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  // check duplicate (very fast if indexed)
  const isAlreadyApplied = await Speaker.exists({
    eventId: payload.eventId,
    userId: user._id,
  });

  if (isAlreadyApplied) {
    throw new AppError("You have already applied for this event", 400);
  }

  const result = await Speaker.create({
    ...payload,
    userId: user._id,
    eventId: event._id,
  });
  return result;
};

const getAllAppliedSpeakers = async (query: any) => {
  const { page = 1, limit = 10, status, ...rest } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const filters: any = {};

  // ✅ status filter (validated)
  const validStatus = ["pending", "approved", "rejected"];
  if (status && validStatus.includes(status)) {
    filters.status = status;
  }

  // ✅ optional: other safe filters (eventId, userId)
  if (rest.eventId) {
    filters.eventId = rest.eventId;
  }

  if (rest.userId) {
    filters.userId = rest.userId;
  }

  // run queries in parallel
  const [data, total] = await Promise.all([
    Speaker.find(filters)
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 })
      .lean(),
    Speaker.countDocuments(filters),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data,
  };
};

const getSingleDetailsForSpeaker = async (id: string) => {
  const isExists = await Speaker.findById({ _id: id });
  if (!isExists) {
    throw new AppError("Speaker not found", 404);
  }

  const result = await Speaker.findById(id)
    .populate({
      path: "userId",
      select: "firstName lastName image role email",
    })
    .populate({
      path: "eventId",
      select: "title thumbnail",
    });
  return result;
};

const speakerService = {
  applyForSpeaker,
  getAllAppliedSpeakers,
  getSingleDetailsForSpeaker,
};

export default speakerService;
