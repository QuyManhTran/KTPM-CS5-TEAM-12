import dotenv from "dotenv";
dotenv.config();
const env = {
    PORT: Number(process.env.PORT),
    PAGE_SIZE: Number(process.env.PAGE_SIZE),
    CRAWL_MAX: Number(process.env.CRAWL_MAX),
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_HOST: process.env.REDIS_HOST,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    BASE_URL: process.env.BASE_URL,
};

export default env;
