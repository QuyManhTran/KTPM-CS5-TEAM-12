import { CacheMiddleware } from "../middleware/caching.js";
import { ResponseMiddleware } from "../middleware/response.js";
import v1Router from "./v1/index.js";

export const routeConfig = (app) => {
    app.use("/api/v1", [ResponseMiddleware, CacheMiddleware], v1Router);
};
