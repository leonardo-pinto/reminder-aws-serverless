import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const tableDdb = process.env.TABLE_DDB!;
const dbClient = new DynamoDB.DocumentClient();

interface ReminderResponse {
  content: string;
  email: string;
  reminderDate: string;
}

export async function handler(
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> {
  const data = await dbClient
    .query({
      TableName: tableDdb,
      KeyConditionExpression: `pk = :userId AND begins_with(sk, :prefix)`,
      ExpressionAttributeValues: {
        ":userId": `userId#${event.requestContext.authorizer!.claims.sub}`,
        ":prefix": "reminderId",
      },
      ProjectionExpression: "content, reminderDate, email",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify(data.Items as ReminderResponse[]),
  };
}
