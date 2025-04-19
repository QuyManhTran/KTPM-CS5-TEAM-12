import ReleaseService from "../service/release.js";

export default class ReleaseController {
    static async getRelease(req, res) {
        try {
            const releases = await ReleaseService.getReleases();
            res.success(200, releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    }

    static async getFirstRelease(req, res) {
        try {
            const releases = await ReleaseService.getFirstReleases();
            res.success(200, releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    }

    static getCommitsByReleaseId = async (req, res) => {
        const { releaseId } = req.params;
        try {
            const releases = await ReleaseService.getCommitsByReleaseId(releaseId, req.pagination);
            res.success(200, releases);
        } catch (error) {
            console.error("❌ Error:", error.message);
            res.error(500, "Internal Server Error");
        }
    };
}
