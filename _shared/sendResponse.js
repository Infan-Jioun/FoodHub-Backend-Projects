export const sendResponse = (res, responseData) => {
    const { httpStatusCode, message, success, data, meta } = responseData;
    res.status(httpStatusCode).json({
        success,
        message,
        data,
        meta
    });
};