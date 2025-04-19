import request from "../config/axios.js";
import { getMeta } from "../util/commit.js";

export async function crawlFirstCommitByReleaseId({
    id1,
    tag1,
    id2,
    tag2,
    repoID1,
    repoID2,
    user,
    name,
}) {
    if (!id2 || !tag2 || !repoID2) {
        console.log("❌ Error: First version don't have any commits");
        return;
    }
    const pathUrls = `/repos/${user}/${name}/compare/${tag2}...${tag1}`;
    try {
        const response = await request.get(pathUrls, {
            page: 1,
            per_page: 100,
        });
        const commits = response.data.commits.map((commit) => ({
            hash: commit.sha,
            message: commit.commit.message,
            releaseID: id1,
        }));
        const meta = getMeta({
            currentPage: 1,
            total: response.data.total_commits,
            pageSize: 100,
        });
        return {
            isOke: true,
            commits,
            meta: {
                ...meta,
                user,
                name,
                compare: `${tag2}...${tag1}`,
            },
        };
    } catch (error) {
        console.error("Error fetching commits:", error);
        return { isOke: false, commits: [] };
    }
}

export async function crawlCommitByReleaseId({ user, name, compare, page, pageSize, releaseId }) {
    const pathUrls = `/repos/${user}/${name}/compare/${compare}`;
    try {
        const response = await request.get(pathUrls, {
            page,
            per_page: pageSize,
        });
        const commits = response.data.commits.map((commit) => ({
            hash: commit.sha,
            message: commit.commit.message,
            releaseID: releaseId,
        }));
        return {
            isOke: true,
            commits,
        };
    } catch (error) {
        console.error("Error fetching commits:", error);
        return { isOke: false, commits: [] };
    }
}
