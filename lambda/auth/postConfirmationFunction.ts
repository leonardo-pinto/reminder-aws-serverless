import { Callback, Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { DynamoDB, SES } from "aws-sdk";

const remindersDdb = process.env.REMINDERS_DDB!;
const dbClient = new DynamoDB.DocumentClient();
const sesClient = new SES();

export async function handler(
  event: PostConfirmationTriggerEvent,
  context: Context,
  callback: Callback
): Promise<void> {
  console.log(event);

  await dbClient
    .put({
      TableName: remindersDdb,
      Item: {
        pk: `userId#${event.userName}`,
        sk: "METADATA",
        name: event.request.userAttributes.name,
        email: event.request.userAttributes.email,
        ttl: 0,
        createdAt: Date.now(),
      },
    })
    .promise();

  await sesClient
    .verifyEmailIdentity({
      EmailAddress: event.request.userAttributes.email,
    })
    .promise();

  callback(null, event);
}
