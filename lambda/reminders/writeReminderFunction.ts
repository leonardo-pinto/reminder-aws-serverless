import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { v4 as uuid } from "uuid";

const tableDdb = process.env.TABLE_DDB!;
const dbClient = new DynamoDB.DocumentClient();

interface Reminder {
  content: string;
  reminderDate: string;
  email?: string;
}

interface ReminderRepository {
  pk: string;
  sk: string;
  ttl: number;
  content: string;
  email: string;
  reminderDate: string;
  createdAt: number;
}

export async function handler(
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  try {
    const reminderRequest = JSON.parse(event.body!) as Reminder;

    // TODO ADD TTL CALCULATION BASED ON INPUT
    const timestamp = Date.now();
    const ttl = ~~(timestamp / 1000 + 1 * 60);
    const reminderId = uuid();

    const reminder: ReminderRepository = {
      pk: `userId#${event.requestContext.authorizer!.claims.sub}`,
      sk: `reminderId#${reminderId}`,
      ttl,
      content: reminderRequest.content,
      email: event.requestContext.authorizer!.claims.email,
      reminderDate: reminderRequest.reminderDate,
      createdAt: timestamp,
    };

    await dbClient
      .put({
        TableName: tableDdb,
        Item: reminder,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        ...reminderRequest,
        email: reminder.email,
      }),
    };
  } catch (error) {
    console.error((error as Error).message);
    return {
      statusCode: 400,
      body: (error as Error).message,
    };
  }
}
