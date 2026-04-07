import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { purchaseRecordService } from "./purchaseRecord.service";

const getMyPurchases = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  const result = await purchaseRecordService.getMyPurchases(userId.toString());

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Purchases retrieved successfully",
    data: result,
  });
});

const getAllPurchases = catchAsync(async (req, res) => {
  const result = await purchaseRecordService.getAllPurchases(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All purchases retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const purchaseRecordController = {
  getMyPurchases,
  getAllPurchases,
};
