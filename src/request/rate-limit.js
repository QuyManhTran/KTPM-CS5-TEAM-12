import request from "../config/axios.js";
import env from "../config/environment.js";

export async function getRateLimit(index) {
    const currentIndex = index % env.GITHUB_TOKEN.length;
    try {
        const { data } = await request.get("/rate_limit", {
            headers: {
                Authorization: `Bearer ${env.GITHUB_TOKEN[currentIndex]}`,
            },
        });
        return data.rate;
    } catch (error) {
        console.error("Error fetching rate limit:", error);
        return null;
    }
}
