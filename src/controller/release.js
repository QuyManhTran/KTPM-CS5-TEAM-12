import ReleaseService from "../service/release.js";

export default class ReleaseController {
    static async getRelease(req, res) {
        try {
            const releases = await ReleaseService.getReleases();
            res.status(200).json(releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    static async getFirstRelease(req, res) {
        try {
            const releases = await ReleaseService.getFirstReleases();
            res.status(200).json(releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    static getCommitsByReleaseId = async (req, res) => {
        const { releaseId } = req.params;
        try {
            const releases = await ReleaseService.getCommitsByReleaseId(releaseId, req.pagination);
            res.status(200).json(releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
