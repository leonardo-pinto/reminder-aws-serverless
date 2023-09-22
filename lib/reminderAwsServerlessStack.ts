import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cwlogs from "aws-cdk-lib/aws-logs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";

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

    const remindersDdb = new dynamodb.Table(this, "RemindersDdb", {
      tableName: "reminders",
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "ttl",
        type: dynamodb.AttributeType.NUMBER,
      },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.OLD_IMAGE,
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    // TODO LAMBDA

    const writeReminderHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "WriteReminderFunction",
      {
        functionName: "WriteReminderFunction",
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "lambda/reminders/writeReminderFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(2),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          REMINDERS_DDB: remindersDdb.tableName,
        },
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      }
    );

    // TODO - ADD GRANULAR PERMISSIONS
    remindersDdb.grantWriteData(writeReminderHandler);

    const fetchReminderHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "FetchReminderFunction",
      {
        functionName: "FetchReminderFunction",
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "lambda/reminders/fetchReminderFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(2),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          REMINDERS_DDB: remindersDdb.tableName,
        },
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      }
    );

    // TODO - ADD GRANULAR PERMISSIONS
    remindersDdb.grantReadData(fetchReminderHandler);

    // TODO API GATEWAY ROUTES W/ LAMBDA INTEGRATION
    const remindersResource = api.root.addResource("reminders");

    const fetchReminderIntegration = new apigateway.LambdaIntegration(
      fetchReminderHandler
    );
    const writeReminderIntegration = new apigateway.LambdaIntegration(
      writeReminderHandler
    );

    remindersResource.addMethod("GET", fetchReminderIntegration);
    remindersResource.addMethod("POST", writeReminderIntegration);

    // TODO EMAIL

    // TODO SMS
  }
}
