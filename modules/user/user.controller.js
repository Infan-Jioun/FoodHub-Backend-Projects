import status from "http-status";
import { userService } from "./user.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";
import { AppError } from "../../_shared/AppError.js";

const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Users retrieved successfully",
        data: users,
        meta: null,
    });
});

const checkUserName = catchAsync(async (req, res) => {
    const { name } = req.query;
    if (!name) {
        throw new AppError(status.BAD_REQUEST, "Name parameter is required");
    }
    const exists = await userService.checkUserNameExists(name);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Name checked successfully",
        data: { exists },
        meta: null,
    });
});

const upsertUser = catchAsync(async (req, res) => {
    const result = await userService.upsertUser(req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User saved successfully",
        data: result,
        meta: null,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User deleted successfully",
        data: result,
        meta: null,
    });
});

const updateRoleToUser = catchAsync(async (req, res) => {
    const result = await userService.updateRoleToUser(req.params.id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Role updated to user successfully",
        data: result,
        meta: null,
    });
});

const checkAdminStatus = catchAsync(async (req, res) => {
    const result = await userService.checkAdminStatus(req.params.email, req.decoded.email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin status checked successfully",
        data: result,
        meta: null,
    });
});

const makeUserAdmin = catchAsync(async (req, res) => {
    const result = await userService.makeUserAdmin(req.params.id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User promoted to admin successfully",
        data: result,
        meta: null,
    });
});
const checkModeratorStatus = catchAsync(async (req, res) => {
    const result = await userService.checkModeratorStatus(req.params.email, req.decoded.email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Moderator status checked successfully",
        data: result,
        meta: null,
    });
});

const makeUserModerator = catchAsync(async (req, res) => {
    const result = await userService.makeUserModerator(req.params.id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User promoted to moderator successfully",
        data: result,
        meta: null,
    });
});

const checkOwnerStatus = catchAsync(async (req, res) => {
    const result = await userService.checkOwnerStatus(req.params.email, req.decoded.email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Owner status checked successfully",
        data: result,
        meta: null,
    });
});

const makeUserRestaurantOwner = catchAsync(async (req, res) => {
    const result = await userService.makeUserRestaurantOwner(req.params.id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User promoted to restaurant owner successfully",
        data: result,
        meta: null,
    });
});

export const userController = {
    getAllUsers,
    checkUserName,
    upsertUser,
    deleteUser,
    updateRoleToUser,
    checkAdminStatus,
    makeUserAdmin,
    checkModeratorStatus,
    makeUserModerator,
    checkOwnerStatus,
    makeUserRestaurantOwner,
};