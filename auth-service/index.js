const fs = require("fs");
const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

let rootCertPath;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
  rootCertPath = path.resolve(__dirname, "../certs/root.crt");
} else {
  // if running in Kubernetes, this will be passed as a Kubernetes Secret to /etc/ssl/certs
  rootCertPath = "/etc/ssl/certs/root.crt";
}

const { DB_HOST, DB_PASSWORD, REGION } = process.env;
console.log(DB_HOST, DB_PASSWORD, REGION);

const { Pool } = require("@yugabytedb/pg");
const pool = new Pool({
  database: "yugabyte",
  host: DB_HOST,
  user: "admin",
  port: 5433,
  password: DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 0,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(rootCertPath).toString(),
    servername: DB_HOST,
  },
});

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Authentication Route
app.post("/login", async (req, res) => {
  try {
    const start = Date.now();
    const { username, password } = req.body;

    // const user = users.find((u) => u.username === username);

    console.log("user query start");
    const userQueryStart = Date.now();
    const time = Date.now();
    const userResponse = await pool.query(
      "select * from find_user_credentials($1, $2)",
      [username, REGION]
    );
    const latency = Date.now() - time;

    console.log("userQueryTiming", Date.now() - userQueryStart);
    // const userExplainAnalyze = await pool.query(
    //   "explain analyze select * from find_user_credentials($1, $2)",
    //   [username, REGION]
    // );

    // console.log("userExplainAnalyze", userExplainAnalyze);
    // console.log("compareSync start");
    // const compareSyncStart = Date.now();
    const user = userResponse?.rows?.[0];
    if (!user?.password || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    // console.log("compareSync block timing", Date.now() - compareSyncStart);

    // console.log("jwt signing block start");
    // const signingBlockStart = Date.now();
    delete user?.password;
    const token = jwt.sign({ user }, "your_jwt_secret", {
      expiresIn: "24h",
    }); // 24 hours
    // console.log("jwt signing block timing", Date.now() - signingBlockStart);

    // const totalTime = Date.now() - start;
    // console.log("totalTime", totalTime);
    res.send({ token, latency });
  } catch (e) {
    console.log(`Error in /login: ${e}`);
    res.status(400).send(`Error in /login`);
  }
});

app.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const password = bcrypt.hashSync(req.body.password, 8);
    const geo = req.body.geo || REGION;
    const time = Date.now();
    await pool.query(
      "INSERT INTO users(first_name, last_name, username, password, geo) VALUES ($1, $2, $3, $4, $5)",
      [firstName, lastName, username, password, geo]
    );
    const latency = Date.now() - time;
    res.status(201).send({ status: "Created user successfully.", latency });
  } catch (e) {
    console.log(`Error in POST /users: ${e}`);
    res.status(400).send(`Error in POST /users`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
