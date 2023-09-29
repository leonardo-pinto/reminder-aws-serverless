import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cwlogs from "aws-cdk-lib/aws-logs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaEventSource from "aws-cdk-lib/aws-lambda-event-sources";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";

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

    const tabledDb = new dynamodb.Table(this, "RemindersDdb", {
      tableName: "table",
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
          TABLE_DDB: tabledDb.tableName,
        },
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      }
    );

    tabledDb.grantWriteData(writeReminderHandler);

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
          TABLE_DDB: tabledDb.tableName,
        },
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      }
    );

    const fetchRemindersDdbPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["dynamodb:Query"],
      resources: [tabledDb.tableArn],
    });

    fetchReminderHandler.addToRolePolicy(fetchRemindersDdbPolicy);

    const sendReminderNotificationHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "SendReminderNotificationFunction",
      {
        functionName: "SendReminderNotificationFunction",
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "lambda/reminders/sendReminderNotificationFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(2),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      }
    );

    sendReminderNotificationHandler.addEventSource(
      new lambdaEventSource.DynamoEventSource(tabledDb, {
        startingPosition: lambda.StartingPosition.LATEST,
        retryAttempts: 0,
        filters: [
          lambda.FilterCriteria.filter({
            eventName: lambda.FilterRule.isEqual("REMOVE"),
          }),
        ],
      })
    );

    const sendReminderNotificationSESPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ses:SendEmail", "ses:SendRawEmail"],
      resources: ["*"],
    });
    sendReminderNotificationHandler.addToRolePolicy(
      sendReminderNotificationSESPolicy
    );

    // COGNITO

    const postConfirmationHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "PostConfirmationFunction",
      {
        functionName: "PostConfirmationFunction",
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: "lambda/auth/postConfirmationFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(2),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          TABLE_DDB: tabledDb.tableName,
        },
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      }
    );
    tabledDb.grantWriteData(postConfirmationHandler);

    const postConfirmationSESPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ses:VerifyEmailIdentity"],
      resources: ["*"],
    });
    postConfirmationHandler.addToRolePolicy(postConfirmationSESPolicy);

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "UserPool",
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email for the Reminder App",
        emailBody:
          "Thanks for signing up to Reminder App. Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: {
        username: false,
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: false,
        },
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        postConfirmation: postConfirmationHandler,
      },
    });

    userPool.addDomain("UserDomain", {
      cognitoDomain: {
        domainPrefix: "reminder-app-user",
      },
    });

    userPool.addClient("user-client", {
      userPoolClientName: "userClient",
      authFlows: {
        userSrp: true,
      },
      accessTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(7),
      oAuth: {
        scopes: [cognito.OAuthScope.EMAIL],
      },
    });

    const authorizer = new apigateway.CfnAuthorizer(this, "CfnAuthorizer", {
      restApiId: api.restApiId,
      name: "APIGatewayAuthorizer",
      type: "COGNITO_USER_POOLS",
      identitySource: "method.request.header.Authorization",
      providerArns: [userPool.userPoolArn],
    });

    const remindersResource = api.root.addResource("reminders");

    remindersResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(fetchReminderHandler),
      {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizer: {
          authorizerId: authorizer.ref,
        },
      }
    );

    const createReminderRequestValidator = new apigateway.RequestValidator(
      this,
      "createReminderRequestValidator",
      {
        restApi: api,
        requestValidatorName: "CreateReminderRequestValidator",
        validateRequestBody: true,
      }
    );

    const reminderModel = new apigateway.Model(this, "ReminderModel", {
      modelName: "ReminderModel",
      restApi: api,
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          content: {
            type: apigateway.JsonSchemaType.STRING,
          },
          reminderDate: {
            type: apigateway.JsonSchemaType.STRING,
          },
        },
        required: ["content", "reminderDate"],
      },
    });

    remindersResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(writeReminderHandler),
      {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizer: {
          authorizerId: authorizer.ref,
        },
        requestValidator: createReminderRequestValidator,
        requestModels: {
          "application/json": reminderModel,
        },
      }
    );
  }
}
