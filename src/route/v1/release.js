import { Router } from "express";
import ReleaseController from "../../controller/release.js";
import PaginationMiddleware from "../../middleware/pagination.js";

const releaseRouter = Router();
releaseRouter.get("/", ReleaseController.getRelease);
releaseRouter.get("/first", ReleaseController.getFirstRelease);
releaseRouter.get(
    "/:releaseId/commits",
    PaginationMiddleware,
    ReleaseController.getCommitsByReleaseId,
);
releaseRouter.get("/count", ReleaseController.getReleaseCount);
export default releaseRouter;
