const util = require("util");
const callPredict = require("./vertexService");

async function run() {
  const embeddings = await callPredict("mob movie heist");

  process.stdout.write(
    `${util.inspect(embeddings, { maxArrayLength: 1000 })}\n`
  );
}

run();
