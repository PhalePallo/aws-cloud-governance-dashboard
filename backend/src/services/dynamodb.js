import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.AUDIT_TABLE_NAME || "";

export async function fetchLogs() {
  if (!TABLE_NAME) {
    console.error("DynamoDB table name not set in environment variable AUDIT_TABLE_NAME");
    return [];
  }

  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (err) {
    console.error("Error fetching logs from DynamoDB:", err);
    return [];
  }
}
