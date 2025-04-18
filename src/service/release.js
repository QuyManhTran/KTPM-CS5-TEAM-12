import * as ReleaseRepository from "../repository/release.js";
export default class ReleaseService {
    static async getReleases() {
        return ReleaseRepository.getReleases();
    }

    static async getFirstReleases() {
        return ReleaseRepository.getFirstReleases([]);
    }
}
