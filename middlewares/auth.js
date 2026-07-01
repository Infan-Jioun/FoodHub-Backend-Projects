import jwt from "jsonwebtoken";
import { getCollections } from "../config/collections.js";

export const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized access" });
    }
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_WEB_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
    });
};

export const verifyAdmin = async (req, res, next) => {
    const { usersCollection } = getCollections();
    const email = req.decoded.email;
    const user = await usersCollection.findOne({ email });
    const isAdmin = user?.role === "admin";
    if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
    }
    next();
};

export const verifyModerator = async (req, res, next) => {
    const { usersCollection } = getCollections();
    const email = req.decoded.email;
    const user = await usersCollection.findOne({ email });
    const isModerator = user?.role === "moderator";
    if (!isModerator) {
        return res.status(403).send({ message: "forbidden access" });
    }
    next();
};

export const verifyOwner = async (req, res, next) => {
    const { usersCollection } = getCollections();
    const email = req.decoded.email;
    const user = await usersCollection.findOne({ email });
    const isOwner = user?.role === "owner";
    if (!isOwner) {
        return res.status(403).send({ message: "forbidden access" });
    }
    next();
};

export const verifyRole = (role) => {
    return async (req, res, next) => {
        const { usersCollection } = getCollections();
        const email = req.decoded.email;
        const user = await usersCollection.findOne({ email });
        if (!user || user.role !== role) {
            return res.status(403).send({ message: "forbidden access" });
        }
        next();
    };
};