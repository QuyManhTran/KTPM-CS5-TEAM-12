import RepoService from "../service/repo.js";
import ReleaseService from "../service/release.js";

export default class RepoController {
    static getRepo = async (req, res) => {
        try {
            const repos = await RepoService.getRepo(req.pagination);
            res.status(200).json(repos);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    static getReleasesByRepoId = async (req, res) => {
        const { repoId } = req.params;
        try {
            const releases = await ReleaseService.getReleasesByRepoId(repoId, req.pagination);
            res.status(200).json(releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
