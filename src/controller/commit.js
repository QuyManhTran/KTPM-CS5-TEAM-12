import CommitService from "../service/commit.js";

export default class CommitController {
    static getCommits = async (req, res) => {
        try {
            const commits = await CommitService.getCommits();
            res.status(200).json(commits);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
