import { Queue } from "bullmq";
import redisQueue from "./index.js";
import { FIRST_COMMIT_QUEUE, REPO_QUEUE, TAG_QUEUE } from "../constant/queue.js";

const repoQueue = new Queue(REPO_QUEUE, {
    connection: redisQueue,
});

const tagQueue = new Queue(TAG_QUEUE, {
    connection: redisQueue,
});

const firstCommitQueue = new Queue(FIRST_COMMIT_QUEUE, {
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

const addCommitToQueue = async (data) => {
    firstCommitQueue.add("crawl-commit", data, {
        removeOnComplete: true,
    });
};

export { addRepoToQueue, addTagToQueue, addCommitToQueue };
