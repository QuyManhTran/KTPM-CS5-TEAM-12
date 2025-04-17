import express from "express";
import { sequelize, Repository, Release } from "./src/sqlite/index.js";
import bodyParser from "body-parser";
import { releaseScheduler, repoScheduler, firstCommitScheduler } from "./src/scheduler/index.js";
import env from "./src/config/environment.js";
import * as RepoRepository from "./src/repository/repo.js";
import * as ReleaseRepository from "./src/repository/release.js";
import * as CommitRepository from "./src/repository/commit.js";
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
        const repositories = await RepoRepository.findAll();
        res.json(repositories);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/releases", async (req, res) => {
    try {
        const releases = await ReleaseRepository.getReleases();
        res.json(releases);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/releases-test", async (req, res) => {
    try {
        const releaseIds = []; // Example release IDs
        const releases = await ReleaseRepository.getFirstReleases(releaseIds);
        res.json(releases);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/repo-not-in-releases", async (req, res) => {
    try {
        const repositories = await RepoRepository.getReposNotTags();
        res.json(repositories);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/commits", async (req, res) => {
    try {
        const commits = await CommitRepository.getAllCommits();
        res.json(commits);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // repoScheduler.start();
    // releaseScheduler.start();
    // firstCommitScheduler.start();
});
