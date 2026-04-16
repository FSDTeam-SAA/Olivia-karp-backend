import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import teamService from "./team.service";

const createNewTeamMember = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  
  const result = await teamService.createNewTeamMember(req.body, files);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Team member created successfully",
    data: result,
  });
});

const getAllTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.getAllTeamMembers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team members retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.getSingleTeamMember(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member retrieved successfully",
    data: result,
  });
});

const updateTeamMember = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  
  const result = await teamService.updateTeamMember(req.params.id, req.body, files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member updated successfully",
    data: result,
  });
});

const deleteTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await teamService.deleteTeamMember(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member deleted successfully",
    data: result,
  });
});

const teamController = {
  createNewTeamMember,
  getAllTeamMembers,
  getSingleTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

export default teamController;
