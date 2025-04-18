import { Router } from "express";
import RepoController from "../../controller/repo.js";

const repoRouter = Router();
repoRouter.get("", RepoController.getRepo);
export default repoRouter;
