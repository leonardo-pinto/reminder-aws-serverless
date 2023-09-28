#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ReminderAwsServerlessStack } from "../lib/reminderAwsServerlessStack";
import { ReminderAwsServerlessClientStack } from "../lib/reminderAwsServerlessClientStack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.AWS_ACCOUNT_NUMBER,
  region: process.env.AWS_REGION,
};

new ReminderAwsServerlessStack(app, "ReminderAwsServerlessStack", { env });

new ReminderAwsServerlessClientStack(app, "ReminderAwsServerlessClientStack", {
  env,
});
