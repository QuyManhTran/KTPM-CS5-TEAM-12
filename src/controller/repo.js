import RepoService from "../service/repo.js";

export default class RepoController {
    static getRepo = async (req, res) => {
        try {
            const repos = await RepoService.getRepo();
            res.status(200).json(repos);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
