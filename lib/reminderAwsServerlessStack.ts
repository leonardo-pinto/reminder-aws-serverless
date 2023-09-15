import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cwlogs from "aws-cdk-lib/aws-logs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ReminderAwsServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logGroup = new cwlogs.LogGroup(this, "ReminderAPILogs");

    const api = new apigateway.RestApi(this, "ReminderAPI", {
      restApiName: "Reminder API",
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
      },
    });

    // TODO COGNITO

    // TODO API GATEWAY ROUTES W/ LAMBDA INTEGRATION

    const remindersDdb = new dynamodb.Table(this, "RemindersDdb", {
      tableName: "reminders",
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.OLD_IMAGE,
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    // TODO LAMBDA

    // TODO EMAIL

    // TODO SMS
  }
}
