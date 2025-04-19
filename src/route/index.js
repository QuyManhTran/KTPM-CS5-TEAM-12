import { ResponseMiddleware } from "../middleware/response.js";
import v1Router from "./v1/index.js";

export const routeConfig = (app) => {
    app.use("/api/v1", ResponseMiddleware, v1Router);
};
