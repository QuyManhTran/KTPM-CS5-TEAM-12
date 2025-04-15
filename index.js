import express from "express";
import { sequelize, Repository, Release } from "./src/sqlite/index.js";
import bodyParser from "body-parser";
import { releaseScheduler, repoScheduler } from "./src/scheduler/index.js";
import env from "./src/config/environment.js";
import { getReposNotTags } from "./src/repository/repo.js";
const app = express();
const port = env.PORT;

// Sync database and create tables
sequelize
    .sync()
    .then(() => {
        console.log("Database connected and tables created!");
    })
    .catch((error) => {
        console.error("❌ Error connecting to the database:", error);
    });

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const repositories = await Repository.findAll();
        res.json(repositories);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/releases", async (req, res) => {
    try {
        const releases = await Release.findAll({
            attributes: ["id", "tag"],
            include: [
                {
                    model: Repository,
                    required: true,
                },
            ],
            offset: 0,
            limit: 10,
        });
        res.json(releases);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/repo-not-in-releases", async (req, res) => {
    try {
        const repositories = await getReposNotTags();
        res.json(repositories);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // repoScheduler.start();
    // releaseScheduler.start();
});
