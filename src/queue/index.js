import Redis from "ioredis";
import env from "../config/environment.js";

const redisQueue = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
});

export default redisQueue;
