import { getKey } from "../config/redis.js";

export async function CacheMiddleware(req, res, next) {
    const cacheKey = req.originalUrl;
    const cachedData = await getKey(cacheKey);

    if (cachedData) {
        console.log("Cache hit for:", cacheKey);
        return res.success(200, cachedData);
    } else {
        console.log("Cache miss for:", cacheKey);
    }

    next();
}
