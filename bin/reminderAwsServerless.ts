#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/apiStack";
import { ClientStack } from "../lib/clientStack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.AWS_ACCOUNT_NUMBER,
  region: process.env.AWS_REGION,
};

new ApiStack(app, "ApiStack", { env });

new ClientStack(app, "ClientStack", { env });
