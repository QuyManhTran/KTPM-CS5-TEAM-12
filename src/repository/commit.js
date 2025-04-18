import { Commit } from "../sqlite/index.js";

export async function bulkCreate(commits) {
    return Commit.bulkCreate(commits, {
        updateOnDuplicate: ["message"],
    });
}

export async function getAllCommits() {
    return Commit.findAll();
}

export async function count() {
    return Commit.count();
}

export async function countByReleaseId(releaseId) {
    return Commit.count({
        where: {
            releaseID: releaseId,
        },
    });
}

export async function findAllByReleaseId(releaseId, { limit, offset }) {
    return Commit.findAll({
        where: {
            releaseID: releaseId,
        },
        attributes: ["id", "hash", "message", "releaseID"],
        limit,
        offset,
    });
}
