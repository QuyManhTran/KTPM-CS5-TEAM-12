import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../constant/query";

const PaginationMiddleware = (req, res, next) => {
    const { page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate page and limit
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Attach pagination info to the request object
    req.pagination = {
        page: pageNumber,
        limit: limitNumber,
        offset: (pageNumber - 1) * limitNumber,
    };

    next();
};
