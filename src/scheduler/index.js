import cron from "node-cron";
import { Repository } from "../sqlite/index.js";
import { getKey, setKey } from "../config/redis.js";
import env from "../config/environment.js";
import { addRepoToQueue, addTagToQueue } from "../queue/queue.js";
import { FIRST_RELEASES, REPO_KEY, REPO_NOT_TAGS } from "../constant/redis.js";
import { getReposNotTags } from "../repository/repo.js";

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
    const repos = await getReposNotTags(existRepos);
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
    const firstReleases = await getKeyOrInit(FIRST_RELEASES, []);
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

/* const $ = load(data);

$("a.Box-sc-g0xbh4-0.prc-Link-Link-85e08").each((_, el) => {
    const href = $(el).attr("href");
    if (!href.includes("/stargazers")) return;
    const lable = $(el).attr("aria-label");
    if (lable) {
        results.push({
            link: `https://github.com${href.replace("/stargazers", "")}`,
            star: lable.replace(" stars", ""),
        });
    }
}); */

/* async function crawlTagHandler() {
    const per_page = env.PAGE_SIZE;
    const page = (await getKeyOrInit("release", 0)) + 1;
    const repos = await Repository.findAll({
        offset: (page - 1) * per_page,
        limit: per_page,
    });
    if (!repos.length) {
        console.log("No more repositories to crawl for releases.");
        return;
    }
    console.log("🚀 Crawling GitHub tags...");
    const data = await Promise.all(
        repos.map(async (repos) => {
            const { user, name, id } = repos;
            return crawlGitHubTagsByRepo({ user, name, repoID: id });
        }),
    );
    const releases = data.flat();
    console.log("🚀 Crawled releases: ", releases);
    try {
        await Release.bulkCreate(releases, {
            updateOnDuplicate: ["content"],
        });
        await setKey("release", page);
        console.log("✅ Releases saved to database");
        console.log("✅ Release page is updated to: ", page);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

async function crawlRepoHandler() {
    const per_page = env.PAGE_SIZE;
    let page = await getKey(REPO_KEY);
    if (!page) {
        const numberRepositories = await Repository.count();
        console.log("numberRepositories: ", numberRepositories);
        page = numberRepositories / per_page;
    }
    page += 1;
    const isOk = await crawlGitHubRepoLinks({ page, per_page });
    if (isOk) {
        await setKey(REPO_KEY, page, 5 * 60);
        console.log("✅ Repo page is updated to: ", page);
    }
} */
