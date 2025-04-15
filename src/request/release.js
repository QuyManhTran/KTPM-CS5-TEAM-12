import request from "../config/axios.js";

export async function crawlGitHubTagsByRepo({ user, name, repoID }) {
    const pathTagsUrl = `/repos/${user}/${name}/tags`;
    const pathSingleTagUrl = `/repos/${user}/${name}/releases`;
    try {
        console.log(`🚀 Crawling GitHub tags of ${user}/${name}...`);
        const { data: tags } = await request.get(pathTagsUrl);
        if (!tags.length) return { isOke: true, data: [] };
        const releases = await Promise.all(
            tags.map(async (tag) => {
                try {
                    const { data: release } = await request.get(
                        `${pathSingleTagUrl}/tags/${tag.name}`,
                    );
                    return {
                        content: release.body,
                        repoID,
                        tag: tag.name,
                    };
                } catch (error) {
                    console.error(
                        `❌ Error fetching release in repo ${user}/${name} for tag ${tag.name}:`,
                        error.message,
                    );
                    return null;
                }
            }),
        );
        return { isOke: true, data: releases.filter((release) => release !== null) };
    } catch (error) {
        console.error("❌ Error:", error.message);
        return { isOke: false, data: null };
    }
}
