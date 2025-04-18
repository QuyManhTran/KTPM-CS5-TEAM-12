import { Op } from "sequelize";
import { Release, Repository } from "../sqlite/index.js";
import env from "../config/environment.js";

export const findAll = async ({ limit, offset }) => {
    return Repository.findAll({
        attributes: ["id", "user", "name"],
        limit,
        offset,
    });
};

export const count = async () => {
    return Repository.count();
};

export const getReposNotTags = async (existRepos) => {
    if (!Array.isArray(existRepos)) {
        existRepos = [];
    }
    return Repository.findAll({
        include: [
            {
                model: Release,
                as: "releases",
                required: false,
                attributes: [],
            },
        ],
        where: {
            "$releases.id$": null,
            id: {
                [Op.notIn]: existRepos,
            },
        },
        attributes: ["id", "user", "name"],
        offset: 0,
        limit: env.PAGE_SIZE,
        subQuery: false,
    });
};
