import { Worker } from "bullmq";
import { crawlGitHubRepoLinks } from "../request/repo.js";
import { setKey } from "../config/redis.js";
import redisQueue from "./index.js";
import { REPO_QUEUE, TAG_QUEUE } from "../constant/queue.js";
import { REPO_KEY, REPO_NOT_TAGS } from "../constant/redis.js";
import { crawlGitHubTagsByRepo } from "../request/release.js";
import { getKeyOrInit } from "../scheduler/index.js";
import { Release } from "../sqlite/index.js";

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
