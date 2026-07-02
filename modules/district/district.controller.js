import status from "http-status";
import { districtService } from "./district.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data, code = status.OK) =>
    sendResponse(res, { httpStatusCode: code, success: true, message, data, meta: null });

const getAllDistricts = catchAsync(async (req, res) => {
    const result = await districtService.getAllDistricts();
    ok(res, "Districts retrieved successfully", result);
});

const addDistrict = catchAsync(async (req, res) => {
    const result = await districtService.addDistrict(req.body);
    ok(res, "District added successfully", result, status.CREATED);
});

export const districtController = {
    getAllDistricts,
    addDistrict,
};