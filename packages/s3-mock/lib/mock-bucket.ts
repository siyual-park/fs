import * as AWS from "aws-sdk";
import uniqid from "uniqid";

import { Resource } from "@internal/test-helper";

class MockBucket implements Resource {
  readonly bucketName: string;

  constructor(private readonly s3: AWS.S3) {
    this.bucketName = uniqid()
  }

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
    return buckets?.some((bucket) => bucket.Name === this.bucketName) ?? false;
  }
}

export default MockBucket;
