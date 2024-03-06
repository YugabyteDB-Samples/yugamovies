/**
 * TODO(developer): Uncomment these variables before running the sample.\
 * (Not necessary if passing values as arguments)
 */
const aiplatform = require("@google-cloud/aiplatform");
const project = "yugaworld";
const location = "developer_relations";
const publisher = "google";
const model = process.env.VERTEX_AI_MODEL || "textembedding-gecko@001";

// Imports the Google Cloud Prediction service client
const { PredictionServiceClient } = aiplatform.v1;

// Import the helper module for converting arbitrary protobuf.Value objects.
const { helpers } = aiplatform;

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: "us-west1-aiplatform.googleapis.com",
};

// Instantiates a client
const predictionServiceClient = new PredictionServiceClient(clientOptions);

module.exports = async function callPredict(text) {
  // Configure the parent resource
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

  let instances;
  if (typeof text === "string") {
    const instance = {
      content: text,
    };
    const instanceValue = helpers.toValue(instance);
    instances = [instanceValue];
  } else {
    instances = text.map((textVal) => {
      const instance = {
        content: textVal,
      };
      const instanceValue = helpers.toValue(instance);
      return instanceValue;
    });
  }

  const parameter = {
    temperature: 0,
    maxOutputTokens: 256,
    topP: 0,
    topK: 1,
  };
  const parameters = helpers.toValue(parameter);

  const request = {
    endpoint,
    instances,
    parameters,
  };

  // Predict request

  const [response] = await predictionServiceClient.predict(request);
  console.log("Get text embeddings response");
  const predictions = response.predictions;

  const embeddings =
    predictions?.[0]?.structValue?.fields?.embeddings?.structValue?.fields?.values?.listValue?.values?.map(
      (v) => v.numberValue
    );
  return embeddings;
};
