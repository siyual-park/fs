import { S3 } from "aws-sdk";

import { MockBucket, MockServer } from "../lib";

let mockServer: MockServer;
let mockBucket: MockBucket;
let s3: S3;

beforeAll(async () => {
  mockServer = new MockServer();
  await mockServer.init();

  s3 = new S3(mockServer.clientConfig);

  mockBucket = new MockBucket(s3);
  await mockBucket.init();
});

afterAll(async () => {
  await mockBucket.clear();
  await mockServer.clear();
});

describe("MockBucket", () => {
  test("bucket created", async () => {
    const bucketName = mockBucket.bucketName;
    const { Buckets: buckets } = await s3.listBuckets().promise();
    const existsBucket =
      buckets?.some((bucket) => bucket.Name === bucketName) ?? false;
    expect(existsBucket).toBeTruthy();
  });
});
