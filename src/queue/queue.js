import { Queue } from "bullmq";
import redisQueue from "./index.js";
import { COMMIT_QUEUE, FIRST_COMMIT_QUEUE, REPO_QUEUE, TAG_QUEUE } from "../constant/queue.js";

const repoQueue = new Queue(REPO_QUEUE, {
    connection: redisQueue,
});

const tagQueue = new Queue(TAG_QUEUE, {
    connection: redisQueue,
});

const firstCommitQueue = new Queue(FIRST_COMMIT_QUEUE, {
    connection: redisQueue,
});

const commitQueue = new Queue(COMMIT_QUEUE, {
    connection: redisQueue,
});

const addRepoToQueue = async (data) => {
    repoQueue.add("crawl-repo", data, {
        removeOnComplete: true,
    });
};

const addTagToQueue = async (data) => {
    tagQueue.add("crawl-tag", data, {
        removeOnComplete: true,
    });
};

const addFirstCommitToQueue = async (data) => {
    firstCommitQueue.add("crawl-first-commit", data, {
        removeOnComplete: true,
    });
};

const addCommitToQueue = async (data) => {
    commitQueue.add("crawl-commit", data, {
        removeOnComplete: true,
    });
};

export { addRepoToQueue, addTagToQueue, addFirstCommitToQueue, addCommitToQueue };
