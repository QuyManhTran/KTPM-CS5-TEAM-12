import CommitService from "../service/commit.js";

export default class CommitController {
    static getCommits = async (req, res) => {
        try {
            const commits = await CommitService.getCommits();
            res.success(200, commits);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    };

    static getCommitsCount = async (req, res) => {
        try {
            const count = await CommitService.getCommitsCount();
            res.success(200, count);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    };
}
