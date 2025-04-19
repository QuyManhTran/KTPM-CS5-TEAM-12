import express from "express";
import { sequelize } from "./src/sqlite/index.js";
import bodyParser from "body-parser";
import cors from "cors";
import {
    releaseScheduler,
    repoScheduler,
    firstCommitScheduler,
    commitScheduler,
} from "./src/scheduler/index.js";
import env from "./src/config/environment.js";
import { routeConfig } from "./src/route/index.js";
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

// Enable CORS for all routes
app.use(
    cors({
        origin: "*",
        methods: ["GET"],
    }),
);

routeConfig(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // repoScheduler.start();
    // releaseScheduler.start();
    // firstCommitScheduler.start();
    commitScheduler.start();
});
