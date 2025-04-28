import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import env from "./src/config/environment.js";
import { routeConfig } from "./src/route/index.js";
const app = express();
const port = env.PORT;

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
});
