import jwt from "jsonwebtoken";
import { getCollections } from "../config/collections.js";
import { AppError } from "../_shared/AppError.js";
import status from "http-status";

export const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return next(new AppError(status.UNAUTHORIZED, "Unauthorized access"));
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return next(new AppError(status.UNAUTHORIZED, "Unauthorized access"));
    }

    jwt.verify(token, process.env.JWT_WEB_TOKEN, (err, decoded) => {
        if (err) {
            return next(new AppError(status.FORBIDDEN, "forbidden access"));
        }
        req.decoded = decoded;
        next();
    });
};


export const verifyRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.decoded?.email) {
                return next(new AppError(status.UNAUTHORIZED, "Unauthorized access"));
            }

            const { usersCollection } = getCollections();
            const user = await usersCollection.findOne({ email: req.decoded.email });

            if (!user || !allowedRoles.includes(user.role)) {
                return next(new AppError(status.FORBIDDEN, "forbidden access"));
            }

            req.user = user; 
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const verifyAdmin = verifyRole("admin");
export const verifyModerator = verifyRole("moderator");
export const verifyOwner = verifyRole("owner");