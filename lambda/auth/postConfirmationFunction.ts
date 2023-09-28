import { Callback, Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { DynamoDB, SES } from "aws-sdk";

const tableDdb = process.env.TABLE_DDB!;
const dbClient = new DynamoDB.DocumentClient();
const sesClient = new SES();

interface User {
  pk: string;
  sk: string;
  name: string;
  email: string;
  ttl?: number;
  createdAt: number;
}

export async function handler(
  event: PostConfirmationTriggerEvent,
  _context: Context,
  callback: Callback
): Promise<void> {
  const user: User = {
    pk: `userId#${event.userName}`,
    sk: "METADATA#",
    name: event.request.userAttributes.name,
    email: event.request.userAttributes.email,
    ttl: 0,
    createdAt: Date.now(),
  };

  await dbClient
    .put({
      TableName: tableDdb,
      Item: user,
    })
    .promise();

  console.log(
    `Sending SES subscription to ${event.request.userAttributes.email}`
  );
  await sesClient
    .verifyEmailIdentity({
      EmailAddress: event.request.userAttributes.email,
    })
    .promise();

  callback(null, event);
}
