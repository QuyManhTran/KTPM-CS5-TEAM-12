import { Router } from "express";
import repoRouter from "./repo.js";
import releaseRouter from "./release.js";
import commitRouter from "./commit.js";

const v1Router = Router();
v1Router.use("/repos", repoRouter);
v1Router.use("/releases", releaseRouter);
v1Router.use("/commits", commitRouter);
export default v1Router;
