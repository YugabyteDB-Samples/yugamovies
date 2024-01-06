const path = require("path");
const fs = require("fs");
let rootCertPath;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
  rootCertPath = path.resolve(__dirname, "../certs/root.crt");
}
const { Pool } = require("@yugabytedb/pg");
const callPredict = require("../movies-service/vertex/vertexService");

const { DB_HOST, DB_PASSWORD } = process.env;

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

async function main() {
  let id = 0;
  let length = 0;
  let totalCnt = 0;

  do {
    console.log(`Processing rows starting from ${id}`);

    const res = await pool.query(
      "SELECT id, original_title, overview FROM movie " +
        "WHERE id >= $1 and overview IS NOT NULL ORDER BY id LIMIT 200",
      [id]
    );
    length = res.rows.length;
    let rows = res.rows;

    if (length > 0) {
      for (let i = 0; i < length; i++) {
        const overview = rows[i].overview;
        const original_title = rows[i].original_title;

        id = rows[i].id;

        const embeddingResp = await callPredict(
          `${original_title} ${overview}`
        );

        // if (!checkEmbeddingValid(embeddingResp)) return;

        const res = await pool.query(
          "UPDATE movie SET embeddings = $1 WHERE id = $2",
          ["[" + embeddingResp + "]", id]
        );

        totalCnt++;
      }

      id++;

      console.log(`Processed ${totalCnt} rows`);
    }
  } while (length != 0);

  console.log(`Finished generating embeddings for ${totalCnt} rows`);
  process.exit(0);
}

main();
