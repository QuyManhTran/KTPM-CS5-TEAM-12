import request from "../config/axios.js";
import { getKey } from "../config/redis.js";
import { CURRENT_TOKEN_INDEX, LOWEST_STAR } from "../constant/redis.js";
import { getKeyOrInit } from "../scheduler/index.js";
import { Repository } from "../sqlite/index.js";
import { getToken } from "../util/format.js";

export async function crawlGitHubRepoLinks({ page, per_page }) {
    const pathUrl = `/search/repositories`;
    try {
        console.log("🚀 Crawling GitHub repositories...");
        const lowestStar = await getKeyOrInit(LOWEST_STAR, null);
        const currentIndex = await getKey(CURRENT_TOKEN_INDEX);
        if (currentIndex === null) {
            console.error("❌ Token index is null");
            return false;
        }
        const token = getToken(currentIndex);
        const { data } = await request.get(pathUrl, {
            params: {
                page,
                per_page,
                q: lowestStar ? `stars:<${lowestStar}` : "stars:>0",
                sort: "stars",
                order: "desc",
            },
            headers: {
                Authorization: `Bearer ${getToken(currentIndex)}`,
            },
        });

        const results = data.items.map((repo) => ({
            user: repo.owner.login,
            name: repo.name,
            star: repo.stargazers_count,
        }));

        console.log("✅ Crawled: ", results);

        if (results.length) {
            await Repository.bulkCreate(results, {
                updateOnDuplicate: ["star"],
            });
            console.log("✅ Repositories saved to database");
        }
        return true;
    } catch (error) {
        console.error(`❌Fail to crawl Repository page ${page} Error:`, error.message);
        return false;
    }
}
