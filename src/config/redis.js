import Redis from "ioredis";
import env from "./environment.js";

const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
});

const setKey = async (key, value, time) => {
    try {
        if (time) {
            await redis.set(key, JSON.stringify(value), "EX", time);
            console.log(`✅ Key set: ${key}`);
            return;
        }
        await redis.set(key, JSON.stringify(value));
    } catch (error) {
        console.error(`❌ Error set key ${key}: `, error.message);
    }
};

const getKey = async (key) => {
    try {
        const value = await redis.get(key);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    } catch (error) {
        console.error(`❌ Error get key ${key}: `, error.message);
    }
};

const deleteKey = async (key) => {
    try {
        await redis.del(key);
        console.log(`✅ Key deleted: ${key}`);
    } catch (error) {
        console.error(`❌ Error delete key ${key}: `, error.message);
    }
};

export default redis;
export { setKey, getKey, deleteKey };
