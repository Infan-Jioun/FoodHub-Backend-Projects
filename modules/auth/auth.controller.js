import status from "http-status";
import { authService } from "./auth.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const generateToken = catchAsync(async (req, res) => {
    const result = authService.generateToken(req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Token generated successfully",
        data: result,
        meta: null,
    });
});

export const authController = {
    generateToken,
};