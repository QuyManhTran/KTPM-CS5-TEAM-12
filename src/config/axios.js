import axios from "axios";
import env from "./environment.js";

const request = axios.create({
    baseURL: env.BASE_URL,
    headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/vnd.github+json",
        // Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    },
});

export default request;
