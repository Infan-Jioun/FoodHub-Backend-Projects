import status from "http-status";
import { revenueService } from "./revenue.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data) =>
    sendResponse(res, { httpStatusCode: status.OK, success: true, message, data, meta: null });

const getRevenueSummary = catchAsync(async (req, res) => {
    const result = await revenueService.getRevenueSummary();
    ok(res, "Revenue summary retrieved successfully", result);
});

const getRevenueByMonth = catchAsync(async (req, res) => {
    const result = await revenueService.getRevenueByMonth();
    ok(res, "Monthly revenue retrieved successfully", result);
});

const getDailyRevenue = catchAsync(async (req, res) => {
    const result = await revenueService.getDailyRevenue();
    ok(res, "Daily revenue retrieved successfully", result);
});

const getTopItems = catchAsync(async (req, res) => {
    const result = await revenueService.getTopItems();
    ok(res, "Top items retrieved successfully", result);
});

export const revenueController = {
    getRevenueSummary,
    getRevenueByMonth,
    getDailyRevenue,
    getTopItems,
};