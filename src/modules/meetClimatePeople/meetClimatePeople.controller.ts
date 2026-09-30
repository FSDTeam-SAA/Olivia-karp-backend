import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { meetClimatePeopleService } from "./meetClimatePeople.service";

const getAllProfiles = catchAsync(async (req: Request, res: Response) => {
  const result = await meetClimatePeopleService.getAllProfilesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Climate people profiles retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getProfileById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await meetClimatePeopleService.getProfileByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Climate profile details retrieved successfully",
    data: result,
  });
});

const syncProfiles = catchAsync(async (req: Request, res: Response) => {
  const result = await meetClimatePeopleService.syncMembersFromMighty();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Mighty Networks members directory synced successfully",
    data: result,
  });
});

const updateProfileVisibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isVisible } = req.body;
  const result = await meetClimatePeopleService.updateProfileVisibilityInDB(id, Boolean(isVisible));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Profile visibility updated to ${isVisible ? "visible" : "hidden"}`,
    data: result,
  });
});

const getSyncStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await meetClimatePeopleService.getSyncStatusFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Directory sync status retrieved successfully",
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const result = await meetClimatePeopleService.handleMightyWebhook(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Mighty Networks webhook processed successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id || (req.user as any)?._id;
  const result = await meetClimatePeopleService.getMyProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result
      ? "My climate profile retrieved successfully"
      : "No profile created yet for this account",
    data: result,
  });
});

const createOrUpdateMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const result = await meetClimatePeopleService.createOrUpdateMyProfileInDB(
      userId,
      req.body,
      req.file
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Climate profile saved successfully",
      data: result,
    });
  }
);

const deleteMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id || (req.user as any)?._id;
  const result = await meetClimatePeopleService.deleteMyProfileInDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Climate profile deleted successfully",
    data: result,
  });
});

const adminCreateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await meetClimatePeopleService.adminCreateProfileInDB(
    req.body,
    req.file
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Climate profile created successfully by admin",
    data: result,
  });
});

const deleteProfileById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await meetClimatePeopleService.deleteProfileByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Climate profile deleted successfully",
    data: result,
  });
});

export const meetClimatePeopleController = {
  getAllProfiles,
  getProfileById,
  syncProfiles,
  updateProfileVisibility,
  getSyncStatus,
  handleWebhook,
  getMyProfile,
  createOrUpdateMyProfile,
  deleteMyProfile,
  adminCreateProfile,
  deleteProfileById,
};
