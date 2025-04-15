import { Queue } from "bullmq";
import redisQueue from "./index.js";
import { REPO_QUEUE, TAG_QUEUE } from "../constant/queue.js";

const repoQueue = new Queue(REPO_QUEUE, {
    connection: redisQueue,
});

const tagQueue = new Queue(TAG_QUEUE, {
    connection: redisQueue,
});

const addRepoToQueue = async ({ page, per_page }) => {
    repoQueue.add(
        "crawl-repo",
        { page, per_page },
        {
            removeOnComplete: true,
        },
    );
};

const addTagToQueue = async (data) => {
    tagQueue.add("crawl-tag", data, {
        removeOnComplete: true,
    });
};

export { addRepoToQueue, addTagToQueue };
