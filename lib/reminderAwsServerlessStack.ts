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

    // TODO LAMBDA

    // TODO EMAIL

    // TODO SMS
  }
}
