import * as AWS from "aws-sdk";
import uniqid from "uniqid";

import { Resource } from "@internal/test-helper";

class MockBucket implements Resource {
  readonly bucketName = uniqid();

  constructor(private readonly s3: AWS.S3) {}

  async init(): Promise<void> {
    if (!(await this.existBucket())) {
      await this.s3.createBucket({ Bucket: this.bucketName }).promise();
    }
  }

  async clear(): Promise<void> {
    if (await this.existBucket()) {
      await this.s3.deleteBucket({ Bucket: this.bucketName }).promise();
    }
  }

  private async existBucket(): Promise<boolean> {
    const { Buckets: buckets } = await this.s3.listBuckets().promise();
    return buckets?.some((bucket) => bucket.Name === bucket) ?? false;
  }
}

export default MockBucket;
