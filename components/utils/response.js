const response = {
    success: async (res, message, data ) => {
        return res.status(200).json({
            status: true,
            message: message,
            data: data,
        });
    },
    error: async (res, message ) => {
        return res.status(200).json({
            status: false,
            message: message,
            data: null,
        });
    },
    serverError: async (res, message ) => {
        return res.status(400).json({
            status: false,
            message: message,
            data: null,
        });
    },
};
module.exports = response;