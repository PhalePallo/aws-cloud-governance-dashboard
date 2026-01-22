// backend/src/handlers/getAuditLogs.js
import { fetchLogs } from "../services/dynamodb.js";

export const getAuditLogs = async () => {
  try {
    const logs = await fetchLogs();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(logs),
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);

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
