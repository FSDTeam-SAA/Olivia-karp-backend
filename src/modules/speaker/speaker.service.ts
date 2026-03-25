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

  const result = await Speaker.create(payload);
  return result;
};

const speakerService = {
  applyForSpeaker,
};

export default speakerService;
