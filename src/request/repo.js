import request from "../config/axios.js";
import { Repository } from "../sqlite/index.js";

export async function crawlGitHubRepoLinks({ page, per_page }) {
    const pathUrl = `/search/repositories`;
    try {
        const numberRepositories = await Repository.count();
        if (page * per_page <= numberRepositories) {
            console.log("🚀 Already crawled all repositories");
            return false;
        }
        console.log("🚀 Crawling GitHub repositories...");
        const { data } = await request.get(pathUrl, {
            params: {
                page,
                per_page,
                q: "stars:>1",
                sort: "stars",
                order: "desc",
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
                returning: true,
            });
            console.log("✅ Repositories saved to database");
        }
        return true;
    } catch (error) {
        console.error(`❌Fail to crawl Repository page ${page} Error:`, error.message);
        return false;
    }
}
