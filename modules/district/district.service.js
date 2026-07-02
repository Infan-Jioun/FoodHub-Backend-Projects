import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const getAllDistricts = async () => {
    const { districtCollection } = getCollections();
    return await districtCollection.find().toArray();
};

const addDistrict = async (districtData) => {
    const { districtCollection } = getCollections();

    if (!districtData?.districtName) {
        throw new AppError(status.BAD_REQUEST, "districtName is required");
    }

    const existing = await districtCollection.findOne({ districtName: districtData.districtName });
    if (existing) {
        throw new AppError(status.CONFLICT, "District already exists");
    }

    return await districtCollection.insertOne(districtData);
};

export const districtService = {
    getAllDistricts,
    addDistrict,
};