import { Commit } from "../sqlite/index.js";

export async function bulkCreate(commits) {
    return Commit.bulkCreate(commits, {
        updateOnDuplicate: ["message"],
    });
}

export async function getAllCommits() {
    return Commit.findAll();
}
