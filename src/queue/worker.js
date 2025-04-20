import { Worker } from "bullmq";
import { crawlGitHubRepoLinks } from "../request/repo.js";
import { deleteKey, getKey, setKey } from "../config/redis.js";
import redisQueue from "./index.js";
import { COMMIT_QUEUE, FIRST_COMMIT_QUEUE, REPO_QUEUE, TAG_QUEUE } from "../constant/queue.js";
import {
    FIRST_RELEASES,
    LOWEST_STAR,
    NOT_DONE_RELEASES,
    RELEASE,
    REPO_KEY,
    REPO_NOT_TAGS,
} from "../constant/redis.js";
import { crawlGitHubTagsByRepo } from "../request/release.js";
import { getKeyOrInit } from "../scheduler/index.js";
import { Release, Repository } from "../sqlite/index.js";
import { crawlFirstCommitByReleaseId, crawlCommitByReleaseId } from "../request/commit.js";
import * as CommitRepository from "../repository/commit.js";
import { Mutex } from "async-mutex";

const commitMutex = new Mutex();
const firstCommitMutext = new Mutex();

const repoWorker = new Worker(
    REPO_QUEUE,
    async (job) => {
        const { page } = job.data;
        const isOk = await crawlGitHubRepoLinks(job.data);
        if (isOk) {
            if (page < 10) await setKey(REPO_KEY, page);
            else {
                await setKey(REPO_KEY, 0);
                const lowestStar = await Repository.findOne({
                    order: [["star", "ASC"]],
                    limit: 1,
                    attributes: ["id", "user", "name", "star"],
                });
                await setKey(LOWEST_STAR, lowestStar.star + 10000);
            }
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
        const { id1, id2, tag2, repoID2 } = job.data;
        if (!id2 || !tag2 || !repoID2) {
            console.log("❌ Error: First version don't have any commits");
            await firstCommitMutext.runExclusive(async () => {
                const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
                if (!firstReleases.includes(id1)) {
                    await setKey(FIRST_RELEASES, [...firstReleases, id1]);
                }
            });
            /*  const notDoneReleases = await getKeyOrInit(NOT_DONE_RELEASES, []);
        if (!notDoneReleases.includes(id1)) {
            await setKey(NOT_DONE_RELEASES, [...notDoneReleases, id1]);
        } */
            return;
        }
        const { isOke, commits, meta } = await crawlFirstCommitByReleaseId(job.data);
        if (!isOke) return;
        try {
            if (!commits.length) {
                await firstCommitMutext.runExclusive(async () => {
                    const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
                    if (!firstReleases.includes(id1)) {
                        await setKey(FIRST_RELEASES, [...firstReleases, id1]);
                    }
                });
                return;
            }
            await CommitRepository.bulkCreate(commits);
            await firstCommitMutext.runExclusive(async () => {
                const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
                if (!firstReleases.includes(id1)) {
                    await setKey(FIRST_RELEASES, [...firstReleases, id1]);
                }
            });
            if (meta.currentPage < meta.nextPage) {
                await commitMutex.runExclusive(async () => {
                    const notDoneReleases = await getKeyOrInit(NOT_DONE_RELEASES, []);
                    if (!notDoneReleases.includes(id1)) {
                        await setKey(NOT_DONE_RELEASES, [...notDoneReleases, id1]);
                    }
                    const metaRelease = await getKeyOrInit(`${RELEASE}_${id1}`, meta);
                    console.log("🚀 Meta release: ", metaRelease);
                });
            }
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
    },
    {
        connection: redisQueue,
        concurrency: 100,
    },
);

const commitWorker = new Worker(
    COMMIT_QUEUE,
    async (job) => {
        const { releaseId } = job.data;
        if (!releaseId) {
            console.log("❌ Error: Release ID is not provided");
            return;
        }
        const meta = await getKey(`${RELEASE}_${releaseId}`);
        if (!meta) {
            console.log("❌ Error: Meta is not provided", releaseId);
            await commitMutex.runExclusive(async () => {
                const notDoneReleases = await getKey(NOT_DONE_RELEASES);
                if (notDoneReleases.includes(releaseId)) {
                    const newNotDoneReleases = notDoneReleases.filter((id) => id !== releaseId);
                    await setKey(NOT_DONE_RELEASES, newNotDoneReleases);
                    console.log(`✅ Release ID ${releaseId} removed from not done releases`);
                }
            });
            return;
        }
        const { total, currentPage, nextPage, pageSize, totalPage, compare, user, name } = meta;
        if (!total || !currentPage || !nextPage || !pageSize || !totalPage) {
            console.log("❌ Error: Meta is not provided");
            return;
        }
        if (currentPage >= totalPage) {
            console.log(`✅ All commits of relaseid ${releaseId} are crawled for ${user}/${name}`);
            await commitMutex.runExclusive(async () => {
                const notDoneReleases = await getKey(NOT_DONE_RELEASES);
                if (notDoneReleases.includes(releaseId)) {
                    const newNotDoneReleases = notDoneReleases.filter((id) => id !== releaseId);
                    await setKey(NOT_DONE_RELEASES, newNotDoneReleases);
                    await deleteKey(`${RELEASE}_${releaseId}`);
                    console.log(`✅ Release ID ${releaseId} removed from not done releases`);
                }
            });
            return;
        }
        const { isOke, commits } = await crawlCommitByReleaseId({
            user,
            name,
            compare,
            page: nextPage,
            pageSize,
            releaseId,
        });
        if (!isOke) return;
        await CommitRepository.bulkCreate(commits);
        await setKey(`${RELEASE}_${releaseId}`, {
            ...meta,
            currentPage: nextPage,
            nextPage: nextPage >= totalPage ? nextPage : nextPage + 1,
        });
        console.log(
            `✅ All commits of release ID ${releaseId} are crawled for ${user}/${name} - page: ${nextPage}`,
        );
    },
    {
        connection: redisQueue,
        concurrency: 100,
    },
);
