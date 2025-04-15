import env from "../config/environment.js";
import { Release, Repository, sequelize } from "../sqlite/index.js";

export const getReleases = async () => {
    return Release.findAll({
        attributes: ["id", "tag"],
        include: [
            {
                model: Repository,
                required: true,
                attributes: ["id", "user", "name"],
            },
        ],
        offset: 0,
        limit: 10,
    });
};

export const getFirstReleases = async (releaseIds) => {
    const releases = await sequelize.query(
        // `select r1.id as id1, r1.tag as tag1, r2.id as id2, r2.tag as tag2, repo1.id as repoID1, repo2.id as repoID2 from releases as r1 left join releases as r2 on r1.id = r2.id - 1 inner join repos repo1 on repo1.id = r1.repoID inner join repos repo2 on repo2.id = r2.repoID limit 5 offset 0`,
        `WITH ordered AS (
          SELECT
            id,
            tag,
            repoID,
            ROW_NUMBER() OVER (PARTITION BY repoID ORDER BY id) AS rn
          FROM releases
        )
        SELECT
          r1.id AS id1,
          r1.tag AS tag1,
          r2.id AS id2,
          r2.tag AS tag2,
          repo1.id AS repoID1,
          repo2.id AS repoID2
        FROM ordered r1
        LEFT JOIN ordered r2 ON r1.repoID = r2.repoID AND r2.rn = r1.rn + 1
        LEFT JOIN repos repo1 ON repo1.id = r1.repoID
        LEFT JOIN repos repo2 ON repo2.id = r2.repoID
        WHERE r1.id NOT IN (${releaseIds.join(",")})
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                limit: env.PAGE_SIZE,
                offset: 0,
            },
        },
    );
    return releases[0];
};
