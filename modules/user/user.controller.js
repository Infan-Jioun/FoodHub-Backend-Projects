import express from 'express';
import status from 'http-status';
import { userService } from "./user.service.js";
import { catchAsync } from '../../_shared/catchAsync.js';
import { sendResponse } from '../../_shared/sendResponse.js';

const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    sendResponse(res, {
        httpStatusCode: status.OK,
        message: "Users retrieved successfully",
        success: true,
        data: users,
        meta: null
    })
});
export const userController = {
    getAllUsers,

};