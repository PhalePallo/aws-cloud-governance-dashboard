"use strict";

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function fetchLogs() {
  const tableName = process.env.AUDIT_TABLE_NAME;

  if (!tableName) {
    console.error("AUDIT_TABLE_NAME env var is not set");
    return [];
  }

  const result = await docClient.send(new ScanCommand({ TableName: tableName }));
  return result.Items || [];
}

exports.handler = async (event) => {
  try {
    if (event && event.httpMethod === "GET") {
      const logs = await fetchLogs();

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(logs),
      };
    }

    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  } catch (err) {
    console.error("Lambda error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
