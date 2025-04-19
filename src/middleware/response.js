export function ResponseMiddleware(req, res, next) {
    res.success = function (status, data, message = null) {
        return res.status(status).json({
            status: "success",
            data,
            message,
        });
    };

    res.error = function (status, message = null) {
        return res.status(status).json({
            status: "error",
            data: null,
            message,
        });
    };

    next();
}
