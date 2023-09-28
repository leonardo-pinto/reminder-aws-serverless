import { Context, DynamoDBStreamEvent, AttributeValue } from "aws-lambda";
import { AWSError, SES } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

const sesClient = new SES();

interface ReminderData {
  email: string;
  content: string;
}

export async function handler(
  event: DynamoDBStreamEvent,
  _context: Context
): Promise<void> {
  const promises: Promise<PromiseResult<SES.SendEmailResponse, AWSError>>[] =
    [];
  event.Records.forEach(async (record) => {
    try {
      const notificationData = mapToReminderData(record.dynamodb!.OldImage!);
      console.log(`Notification ready to be send!: ${notificationData}`);
      const promise = sendEmailNotification(notificationData);
      promises.push(promise);
    } catch (error) {
      console.log("An error occurred while sending the notification");
      console.error((error as Error).message);
    }
  });

  await Promise.all(promises);
  return;
}

function mapToReminderData(dynamoRecord: {
  [key: string]: AttributeValue;
}): ReminderData {
  const reminderData: ReminderData = {
    email: dynamoRecord!.email.S!,
    content: dynamoRecord!.content.S!,
  };

  return reminderData;
}

function sendEmailNotification(reminderData: ReminderData) {
  return sesClient
    .sendEmail({
      Destination: {
        ToAddresses: [reminderData.email],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `Reminder: ${reminderData.content}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "New Reminder",
        },
      },
      Source: reminderData.email!,
    })
    .promise();
}
