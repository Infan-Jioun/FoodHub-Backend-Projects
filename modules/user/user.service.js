import { ObjectId } from "mongodb";
import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const getAllUsers = async () => {
    const { usersCollection } = getCollections();
    const users = await usersCollection.find().toArray();
    return users;
};

const checkUserNameExists = async (name) => {
    const { usersCollection } = getCollections();
    const existingUser = await usersCollection.findOne({ name: name.trim() });
    return !!existingUser;
};

const upsertUser = async (userData) => {
    const { usersCollection } = getCollections();

    if (!userData?.email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }

    const query = { email: userData.email };
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            ...userData,
            isNew: !!(userData.restaurantAddress && userData.restaurantNumber),
            timestemp: Date.now(),
        }
    };

    const result = await usersCollection.updateOne(query, updateDoc, options);
    return result;
};

const deleteUser = async (id) => {
    const { usersCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid user ID");
    }

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return result;
};

const updateRoleToUser = async (id) => {
    const { usersCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid user ID");
    }

    const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "user" } }
    );

    if (result.matchedCount === 0) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return result;
};

const checkAdminStatus = async (email, decodedEmail) => {
    if (email !== decodedEmail) {
        throw new AppError(status.FORBIDDEN, "forbidden access");
    }

    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({ email });
    return { admin: user?.role === "admin" };
};

const makeUserAdmin = async (id) => {
    const { usersCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid user ID");
    }

    const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "admin" } }
    );

    if (result.matchedCount === 0) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return result;
};
const checkModeratorStatus = async (email, decodedEmail) => {
    if (email !== decodedEmail) {
        throw new AppError(status.FORBIDDEN, "forbidden access");
    }

    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({ email });
    return { moderator: user?.role === "moderator" };
};

const makeUserModerator = async (id) => {
    const { usersCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid user ID");
    }

    const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "moderator" } }
    );

    if (result.matchedCount === 0) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return result;
};

const checkOwnerStatus = async (email, decodedEmail) => {
    if (email !== decodedEmail) {
        throw new AppError(status.FORBIDDEN, "forbidden access");
    }

    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({ email });
    return { owner: user?.role === "owner" };
};

const makeUserRestaurantOwner = async (id) => {
    const { usersCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid user ID");
    }

    const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "owner" } }
    );

    if (result.matchedCount === 0) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return result;
};
export const userService = {
    getAllUsers,
    checkUserNameExists,
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