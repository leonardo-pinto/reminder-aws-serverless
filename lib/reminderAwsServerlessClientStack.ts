import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";
import path from "path";

export class ReminderAwsServerlessClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "ReminderClientBucket", {
      accessControl: s3.BucketAccessControl.PRIVATE,
    });

    new s3Deployment.BucketDeployment(this, "ClientBucketDeploymeny", {
      sources: [
        s3Deployment.Source.asset(`${path.resolve(__dirname)}/../client/dist`),
      ],
      destinationBucket: bucket,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    new cloudfront.Distribution(this, "CloudfrontDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(bucket, {
          originAccessIdentity,
        }),
      },
    });
  }
}
