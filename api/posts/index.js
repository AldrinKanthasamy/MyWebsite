const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB || "portfolio-db";
const containerId = process.env.COSMOS_CONTAINER || "posts";
const postApiKey = process.env.POST_API_KEY || "changeme";

const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
  const container = client.database(databaseId).container(containerId);

  if (req.method === "GET") {
    try {
      const querySpec = { query: "SELECT * FROM c ORDER BY c.createdAt DESC" };
      const { resources: items } = await container.items.query(querySpec).fetchAll();
      context.res = { status: 200, body: items };
    } catch (err) {
      context.log.error(err);
      context.res = { status: 500, body: { error: "Failed to fetch posts" } };
    }
    return;
  }

  if (req.method === "POST") {
    // simple API key protection for demo (do NOT ship production like this)
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!apiKey || apiKey !== postApiKey) {
      context.res = { status: 401, body: { error: "Unauthorized: missing or wrong API key" } };
      return;
    }

    const body = req.body || {};
    if (!body.title || !body.content) {
      context.res = { status: 400, body: { error: "title and content are required" } };
      return;
    }

    const item = {
      id: body.id || `${Date.now()}`,
      title: body.title,
      content: body.content,
      tags: body.tags || [],
      createdAt: new Date().toISOString()
    };

    try {
      const { resource } = await container.items.create(item);
      context.res = { status: 201, body: resource };
    } catch (err) {
      context.log.error(err);
      context.res = { status: 500, body: { error: "Failed to create post" } };
    }
    return;
  }

  context.res = { status: 405, body: { error: "Method not allowed" } };
};
