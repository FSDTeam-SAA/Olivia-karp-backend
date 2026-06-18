import mongoose from "mongoose";
import Notification from "./notification.model";

export const createNotification = async ({
  to,
  message,
  type,
  id,
  title,
}: {
  to: mongoose.Types.ObjectId;
  message: string;
  type: string;
  id: mongoose.Types.ObjectId;
  title: string;
}) => {
  const notification = await Notification.create({
    to,
    message,
    type,
    id,
    title,
  });

  return notification;
};
