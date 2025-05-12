import { Router } from "express";
import CommitController from "../../controller/commit.js";

const commitRouter = Router();
commitRouter.get("", CommitController.getCommits);
commitRouter.get("/count", CommitController.getCommitsCount);
export default commitRouter;
