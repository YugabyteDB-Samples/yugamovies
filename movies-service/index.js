var path = require("path");
const fs = require("fs");
const cors = require("cors");

let rootCertPath;

if (process.env.NODE_ENV === "production") {
  // if running in Kubernetes, this will be passed as a Kubernetes Secret to /etc/ssl/certs
  rootCertPath = "/etc/ssl/certs/root.crt";
} else if (process.env.NODE_ENV === "test") {
  require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
  rootCertPath = path.resolve(__dirname, "./certs/root.crt");
} else {
  require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
  rootCertPath = path.resolve(__dirname, "../certs/root.crt");
}
const { DB_HOST, DB_PASSWORD } = process.env;

const { Pool } = require("@yugabytedb/pg");

const followerReadsPool = new Pool({
  database: "yugabyte",
  host: DB_HOST,
  user: "admin",
  port: 5433,
  password: DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 0, // keep connection open
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(rootCertPath).toString(),
    servername: DB_HOST,
  },
});

followerReadsPool.on("connect", async (c) => {
  console.log("Setting follower reads session properties.");
  await c.query("set yb_read_from_followers = true;");
  await c.query("set session characteristics as transaction read only;");
});

const express = require("express");
const callPredict = require(path.resolve(__dirname, "vertex/vertexService.js"));

const App = express();
App.use(cors());

const getEmbeddings = async function (req, res, next) {
  try {
    const text = req?.query?.searchText;
    console.log("search text:", text);

    if (!text) {
      throw "no searchText supplied to /embeddings";
    }

    const decodedSearchText = atob(text);
    const embeddings = await callPredict(decodedSearchText);
    req.embeddings = `[${embeddings}]`;
    next();
  } catch (err) {
    next(err);
  }
};

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract the token from the 'Authorization' header

  if (!token) {
    return res
      .status(403)
      .send({ message: "A token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token has expired");
      return res.status(401).send({ message: "Token has expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("Invalid token");
      return res.status(401).send({ message: "Invalid token" });
    } else {
      console.log("Error verifying token:", error.message);
      return res.status(401).send({ message: error.message });
    }
  }

  return next();
};

App.get("/test-endpoint", (req, res) => {
  res.status(200).send("Test endpoint reached successfully.");
});

App.get(
  "/movie-recommendations",
  verifyToken,
  getEmbeddings,
  async (req, res) => {
    try {
      const textEmbeddings = req?.embeddings;

      if (!textEmbeddings) throw "No embeddings supplied.";

      let movieQueryText =
        "SELECT original_title, overview from movie where original_language = 'en'";
      const movieQueryParams = [textEmbeddings];
      let count = 2;
      if (req?.query?.voteAverage && !Number.isNaN(req.query.voteAverage)) {
        movieQueryText += ` AND vote_average >= $${count}`;
        movieQueryParams.push(+req.query.voteAverage);
        count++;
      }

      if (req?.query?.genre) {
        movieQueryText += ` AND genres @> $${count}::jsonb`;
        const jsonString = JSON.stringify([{ name: req.query.genre }]);
        movieQueryParams.push(jsonString);
        count++;
      }

      if (textEmbeddings) {
        movieQueryText += ` AND 1 - (embeddings <=> $1::vector) > 0.6`;
      }

      movieQueryText += " order by embeddings <=> $1 LIMIT 5";

      const time = Date.now();
      const dbRes = await followerReadsPool.query(
        movieQueryText,
        movieQueryParams
      );

      const latency = Date.now() - time;

      const recommendations = dbRes?.rows;

      res
        .status(200)
        .send({ data: recommendations, latency, embeddings: textEmbeddings });
    } catch (err) {
      console.log(`Error in /movie-recommendations: ${err}`);
      res.status(400).send(`Error in /movie-recommendations`);
    }
  }
);

App.get("/embeddings", async (req, res) => {
  try {
    const text = req?.query?.searchText;

    if (!text) {
      throw "no searchText supplied to /embeddings";
    }

    const decodedSearchText = atob(text);
    const embeddings = await callPredict(decodedSearchText);

    res.status(200).send(embeddings);
  } catch (e) {
    res.status(400).send(e);
  }
});

App.use((err, req, res, next) => {
  console.log(err); // Log error for debugging

  // Set the response status code
  res.status(500); // Internal Server Error

  // Send the error message back to the client
  res.send(`Error: ${err}`);
});

App.listen(8080, () => {
  console.log("App listening on port 8080");
});
