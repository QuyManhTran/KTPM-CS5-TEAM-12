import cron from "node-cron";
import { getKey, setKey } from "../config/redis.js";
import env from "../config/environment.js";
import { addCommitToQueue, addRepoToQueue, addTagToQueue } from "../queue/queue.js";
import { FIRST_RELEASES, REPO_KEY, REPO_NOT_TAGS } from "../constant/redis.js";
import * as RepoRepository from "../repository/repo.js";
import * as ReleaseRepository from "../repository/release.js";

async function getKeyOrInit(key, defaultValue) {
    let value = await getKey(key);
    if (!value) {
        value = defaultValue;
        await setKey(key, value);
    }
    return value;
}

async function crawlRepoQueueHandler() {
    const per_page = env.PAGE_SIZE;
    let page = await getKey(REPO_KEY);
    if (!page) {
        const numberRepositories = await Repository.count();
        page = numberRepositories / per_page;
    }
    page += 1;
    console.log("🚀 Adding repo job: ", { page, per_page });
    await addRepoToQueue({ page, per_page });
}

async function crawlTagQueueHandler() {
    const existRepos = await getKeyOrInit(REPO_NOT_TAGS, []);
    const repos = await RepoRepository.getReposNotTags(existRepos);
    if (!repos.length) {
        console.log("No more repositories to crawl for releases.");
        return;
    }

    await Promise.all(
        repos.map(async (repos) => {
            const { user, name, id } = repos;
            return addTagToQueue({ user, name, repoID: id });
        }),
    );
}

async function crawlFirstCommitQueueHandler() {
    const firstCrawledReleases = await getKeyOrInit(FIRST_RELEASES, []);
    const firstReleases = await ReleaseRepository.getFirstReleases(firstCrawledReleases);
    if (!firstReleases.length) {
        console.log("No more releases to crawl for commits.");
        return;
    }
    await Promise.all(
        firstReleases.map(async (release) => {
            const { id1, tag1, id2, tag2, repoID1, repoID2 } = release;
            return addCommitToQueue({ id1, tag1, id2, tag2, repoID1, repoID2 });
        }),
    );
}

const repoScheduler = cron.schedule(
    "*/30 * * * * *",
    async () => {
        console.log("🚀 Repo Scheduler started");
        await crawlRepoQueueHandler();
        console.log("✅ Repo Scheduler finished");
    },
    {
        scheduled: false,
    },
);

const releaseScheduler = cron.schedule(
    "*/30 * * * * *",
    async () => {
        console.log("🚀 Release Scheduler started");
        await crawlTagQueueHandler();
        console.log("✅ Release Scheduler finished");
    },
    {
        scheduled: false,
    },
);

export { repoScheduler, releaseScheduler, getKeyOrInit };
