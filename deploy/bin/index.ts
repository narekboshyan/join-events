import "dotenv/config";
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { S3BucketStack } from "../lib/s3-bucket-stack";

const app = new App();

const serviceName =
  process.env.SERVICE_NAME ??
  app.node.tryGetContext("serviceName") ??
  "my-service";

const account =
  process.env.AWS_ACCOUNT ??
  app.node.tryGetContext("awsAccount") ??
  "123456789012";

const region =
  process.env.AWS_REGION ?? app.node.tryGetContext("awsRegion") ?? "us-east-1";

new S3BucketStack(app, `${serviceName}-s3-stack`, {
  env: { account, region },
  serviceName,
});
