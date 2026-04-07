import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import PurchaseRecord from "./purchaseRecord.model";
import { User } from "../user/user.model";

const getMyPurchases = async (userId: string) => {
  const result = await PurchaseRecord.find({
    userId,
    status: { $in: ["paid", "free"] },
  }).sort({ createdAt: -1 });

  return result;
};

const getAllPurchases = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.itemType) filter.itemType = query.itemType;

  const data = await PurchaseRecord.find(filter)
    .populate({
      path: "userId",
      select: "firstName lastName email image",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PurchaseRecord.countDocuments(filter);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

export const purchaseRecordService = {
  getMyPurchases,
  getAllPurchases,
};
