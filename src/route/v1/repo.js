import { Router } from "express";
import RepoController from "../../controller/repo.js";
import PaginationMiddleware from "../../middleware/pagination.js";

const repoRouter = Router();
repoRouter.get("", PaginationMiddleware, RepoController.getRepo);
repoRouter.get("/:repoId/releases", PaginationMiddleware, RepoController.getReleasesByRepoId);

export default repoRouter;
