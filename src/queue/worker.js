import { Worker } from "bullmq";
import { crawlGitHubRepoLinks } from "../request/repo.js";
import { setKey } from "../config/redis.js";
import redisQueue from "./index.js";
import { FIRST_COMMIT_QUEUE, REPO_QUEUE, TAG_QUEUE } from "../constant/queue.js";
import {
    FIRST_RELEASES,
    NOT_DONE_RELEASES,
    RELEASE,
    REPO_KEY,
    REPO_NOT_TAGS,
} from "../constant/redis.js";
import { crawlGitHubTagsByRepo } from "../request/release.js";
import { getKeyOrInit } from "../scheduler/index.js";
import { Release } from "../sqlite/index.js";
import { crawlCommitByReleaseId } from "../request/commit.js";
import * as CommitRepository from "../repository/commit.js";

const repoWorker = new Worker(
    REPO_QUEUE,
    async (job) => {
        const { page, per_page } = job.data;
        const isOk = await crawlGitHubRepoLinks({ page, per_page });
        if (isOk) {
            await setKey(REPO_KEY, page, 5 * 60);
            console.log("✅ Repo page is updated to: ", page);
        }
    },
    {
        connection: redisQueue,
    },
);

const tagWorker = new Worker(
    TAG_QUEUE,
    async (job) => {
        const { user, name, repoID } = job.data;
        const { isOke, data } = await crawlGitHubTagsByRepo({ user, name, repoID });
        if (!isOke) {
            return;
        }

        if (!data.length && repoID !== null) {
            console.log(`No tags found for ${user}/${name}`);
            const existRepos = await getKeyOrInit(REPO_NOT_TAGS, []);
            await setKey(REPO_NOT_TAGS, [...existRepos, repoID]);
            return;
        }

        try {
            console.log(
                `data failed: `,
                data.filter((item) => !item.repoID || !item.content || !item.tag),
            );
            await Release.bulkCreate(data, {
                updateOnDuplicate: ["content"],
            });
            console.log(`✅ Releases of ${user}/${name} saved to database`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
    },
    {
        connection: redisQueue,
        concurrency: 10,
    },
);

const firstCommitWorker = new Worker(
    FIRST_COMMIT_QUEUE,
    async (job) => {
        const { id1, tag1, id2, tag2, repoID1, repoID2, user, name } = job.data;
        if (!id2 || !tag2 || !repoID2) {
            console.log("❌ Error: First version don't have any commits");
            const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
            if (!firstReleases.includes(id1)) {
                await setKey(FIRST_RELEASES, [...firstReleases, id1]);
            }
            /*  const notDoneReleases = await getKeyOrInit(NOT_DONE_RELEASES, []);
        if (!notDoneReleases.includes(id1)) {
            await setKey(NOT_DONE_RELEASES, [...notDoneReleases, id1]);
        } */
            return;
        }
        const { isOke, commits, meta } = await crawlCommitByReleaseId(job.data);
        if (!isOke) return;
        try {
            if (!commits.length) {
                const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
                if (!firstReleases.includes(id1)) {
                    await setKey(FIRST_RELEASES, [...firstReleases, id1]);
                }
                return;
            }
            await CommitRepository.bulkCreate(commits);
            const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
            if (!firstReleases.includes(id1)) {
                await setKey(FIRST_RELEASES, [...firstReleases, id1]);
            }
            if (meta.currentPage < meta.nextPage) {
                const notDoneReleases = await getKeyOrInit(NOT_DONE_RELEASES, []);
                if (!notDoneReleases.includes(id1)) {
                    await setKey(NOT_DONE_RELEASES, [...notDoneReleases, id1]);
                }
                const metaRelease = await getKeyOrInit(`${RELEASE}_${id1}`, meta);
                console.log("🚀 Meta release: ", metaRelease);
            }
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
    },
    {
        connection: redisQueue,
        concurrency: 10,
    },
);
