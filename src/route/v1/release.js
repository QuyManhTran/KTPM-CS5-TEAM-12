import { Router } from "express";
import ReleaseController from "../../controller/release.js";

const releaseRouter = Router();
releaseRouter.get("/", ReleaseController.getRelease);
releaseRouter.get("/first", ReleaseController.getFirstRelease);
export default releaseRouter;
