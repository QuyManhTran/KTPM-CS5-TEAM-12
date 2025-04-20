import env from "../config/environment.js";

const formatStringToArray = (data) => {
    return data.split(",").map((item) => item.trim());
};

const getToken = (index) => {
    return env.GITHUB_TOKEN[index % env.GITHUB_TOKEN.length];
};

export { formatStringToArray, getToken };
