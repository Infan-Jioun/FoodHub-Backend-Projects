import jwt from "jsonwebtoken";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const generateToken = (userInfo) => {
    if (!userInfo?.email) {
        throw new AppError(status.BAD_REQUEST, "Email is required to generate token");
    }

    const token = jwt.sign(userInfo, process.env.JWT_WEB_TOKEN, { expiresIn: "1hr" });
    return { token };
};

export const authService = {
    generateToken,
};