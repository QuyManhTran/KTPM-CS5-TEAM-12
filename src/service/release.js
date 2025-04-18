import * as ReleaseRepository from "../repository/release.js";
import * as CommitRepository from "../repository/commit.js";
export default class ReleaseService {
    static async getReleases() {
        return ReleaseRepository.getReleases();
    }

    static async getFirstReleases() {
        return ReleaseRepository.getFirstReleases([]);
    }

    static async getReleasesByRepoId(repoId, pagination) {
        const releases = await ReleaseRepository.findAllByRepoId(repoId, pagination);
        const count = await ReleaseRepository.countByRepoId(repoId);
        const metadata = {
            total: count,
            currentPage: pagination.page,
            pageSize: pagination.limit,
            totalPage: Math.ceil(count / pagination.limit),
            hasNextPage: pagination.page < Math.ceil(count / pagination.limit),
            hasPrevPage: pagination.page > 1,
        };
        return {
            data: releases,
            metadata,
        };
    }

    static async getCommitsByReleaseId(releaseId, pagination) {
        const commits = await CommitRepository.findAllByReleaseId(releaseId, pagination);
        const count = await CommitRepository.countByReleaseId(releaseId);
        const metadata = {
            total: count,
            currentPage: pagination.page,
            pageSize: pagination.limit,
            totalPage: Math.ceil(count / pagination.limit),
            hasNextPage: pagination.page < Math.ceil(count / pagination.limit),
            hasPrevPage: pagination.page > 1,
        };
        return {
            data: commits,
            metadata,
        };
    }
}
