import express from 'express';
import status from 'http-status';
const getAllUsers = catchAsync(async (req, res) => {
    const users = usersService.getAllUsers();
    sendResponse(res, {
        httpStatusCode: status.OK,
        message: "Users retrieved successfully",
        success: true,
        data: users,
        meta: null
    })
});
const userController = {
    getAllUsers,

};