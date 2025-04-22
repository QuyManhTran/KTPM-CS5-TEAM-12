import RepoService from "../service/repo.js";
import ReleaseService from "../service/release.js";
import { setKey } from "../config/redis.js";

export default class RepoController {
    static getRepo = async (req, res) => {
        try {
            const repos = await RepoService.getRepo(req.pagination);
            await setKey(req.originalUrl, repos, 60);
            res.success(200, repos);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    };

    static getReleasesByRepoId = async (req, res) => {
        const { repoId } = req.params;
        try {
            const releases = await ReleaseService.getReleasesByRepoId(repoId, req.pagination);
            await setKey(req.originalUrl, releases, 60);
            res.success(200, releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    };
}
