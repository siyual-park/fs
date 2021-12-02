import { S3 } from "aws-sdk";
import uniqid from "uniqid";

import { MockBucket, MockServer } from "@internal/s3-mock";

import { Bucket, S3Client } from "../lib";

let mockServer: MockServer;
let mockBucket: MockBucket;

let s3Client: S3Client;
let bucket: Bucket;

beforeAll(async () => {
  mockServer = new MockServer();
  await mockServer.init();

  const s3 = new S3(mockServer.clientConfig);

  mockBucket = new MockBucket(s3);
  await mockBucket.init();

  s3Client = new S3Client(mockServer.clientConfig);
  bucket = await s3Client.getBucket(mockBucket.bucketName);
});

afterAll(async () => {
  await mockBucket.clear();
  await mockServer.clear();
});

describe("create", () => {
  test("success", async () => {
    const key = uniqid();

    const result = await bucket.upload({
      Key: key,
      Body: JSON.stringify({ id: key }),
    });

    expect(result.Bucket != null).toBeTruthy();
    expect(result.ETag != null).toBeTruthy();
    expect(result.Key).toEqual(key);
    expect(result.Location != null).toBeTruthy();
  });
});

describe("head", () => {
  test("success", async () => {
    const key = uniqid();

    await bucket.upload({
      Key: key,
      Body: JSON.stringify({ id: key }),
    });

    const result = await bucket.head({ Key: key });

    expect(result != null).toBeTruthy();
  });
});

describe("getSignedUrl", () => {
  test("success", async () => {
    const key = uniqid();

    await bucket.upload({
      Key: key,
      Body: JSON.stringify({ id: key }),
    });

    const result = await bucket.getSignedUrl({ Key: key });

    expect(result != null).toBeTruthy();
  });
});

describe("list", () => {
  test("success", async () => {
    const key = uniqid();

    await bucket.upload({
      Key: key,
      Body: JSON.stringify({ id: key }),
    });

    const result = await bucket.list({});

    expect(result?.Contents?.length ?? 0).toBeGreaterThan(0);
  });
});

describe("getReadStream", () => {
  test("success", async () => {
    const key = uniqid();

    await bucket.upload({
      Key: key,
      Body: JSON.stringify({ id: key }),
    });

    const result = await bucket.getReadStream({ Key: key });

    expect(result != null).toBeTruthy();
  });
});

test("get", async () => {
  const key = uniqid();

  await bucket.upload({
    Key: key,
    Body: JSON.stringify({ id: key }),
  });

  const result = await bucket.get({ Key: key });

  expect(
    result?.Body != null ? JSON.parse(result.Body.toString()) : undefined
  ).toEqual({ id: key });
});

test("copy", async () => {
  const key = uniqid();
  const targetKey = uniqid();

  await bucket.upload({
    Key: key,
    Body: JSON.stringify({ id: key }),
  });

  const result = await bucket.copy({ CopySource: key, Key: targetKey });

  expect(result != null).toBeTruthy();
});
