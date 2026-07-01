import { getCollections } from "../../config/collections.js";

const getAllUsers = async () => {
    const { usersCollection } = getCollections();
    const users = await usersCollection.find().toArray();
    return users;
    console.log(users)
};

export const userService = {
    getAllUsers
};