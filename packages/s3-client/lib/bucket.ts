/* eslint-disable max-len */

import * as stream from "stream";
import AWS, { AWSError } from "aws-sdk";
import _ from "lodash";

import S3Error from "./s3-error";

type OmitBucket<T> = Omit<T, "Bucket">;

class Bucket {
  constructor(private readonly s3: AWS.S3, public readonly name: string) {}

  async delete(
    params: OmitBucket<AWS.S3.Types.DeleteObjectRequest>
  ): Promise<AWS.S3.DeleteObjectOutput> {
    try {
      return await this.s3
        .deleteObject({
          Bucket: this.name,
          ...params,
        })
        .promise();
    } catch (e: unknown) {
      throw new S3Error(e as AWSError);
    }
  }

  /*
   * 한 request 당 1000개 까지 처리 가능
   * https://stackoverflow.com/questions/45727244/malformedxml-the-xml-you-provided-was-not-well-formed-or-did-not-validate-again
   * */
  async deleteManyIn(
    identifierList: AWS.S3.Types.ObjectIdentifierList
  ): Promise<void> {
    if (identifierList.length === 0) return;

    const partialIdentifierList: AWS.S3.Types.ObjectIdentifierList[] = _.chunk(
      identifierList,
      1000
    );

    await Promise.all(
      partialIdentifierList.map((partition) =>
        this.deleteMany({
          Delete: {
            Objects: partition,
          },
        })
      )
    );
  }

  async deleteMany(
    params: OmitBucket<AWS.S3.Types.DeleteObjectsRequest>
  ): Promise<AWS.S3.DeleteObjectsOutput> {
    try {
      return await this.s3
        .deleteObjects({
          Bucket: this.name,
          ...params,
        })
        .promise();
    } catch (e: unknown) {
      throw new S3Error(e as AWSError);
    }
  }

  async list(
    params: OmitBucket<AWS.S3.Types.ListObjectsV2Request>
  ): Promise<AWS.S3.ListObjectsV2Output | undefined> {
    try {
      return await this.s3
        .listObjectsV2({
          Bucket: this.name,
          ...params,
        })
        .promise();
    } catch (e) {
      return undefined;
    }
  }

  async get(
    params: OmitBucket<AWS.S3.Types.GetObjectRequest>
  ): Promise<AWS.S3.GetObjectOutput | undefined> {
    try {
      return await this.s3
        .getObject({
          Bucket: this.name,
          ...params,
        })
        .promise();
    } catch (e) {
      return undefined;
    }
  }

  async getReadStream(
    params: OmitBucket<AWS.S3.Types.GetObjectRequest>
  ): Promise<stream.Readable | undefined> {
    try {
      return this.s3
        .getObject({
          Bucket: this.name,
          ...params,
        })
        .createReadStream();
    } catch (e) {
      return undefined;
    }
  }

  async copy(
    params: OmitBucket<AWS.S3.Types.CopyObjectRequest>
  ): Promise<AWS.S3.CopyObjectOutput> {
    try {
      return await this.s3
        .copyObject({
          Bucket: this.name,
          ...params,
          CopySource: `/${this.name}/${params.CopySource}`,
        })
        .promise();
    } catch (e: unknown) {
      throw new S3Error(e as AWSError);
    }
  }

  async head(
    params: OmitBucket<AWS.S3.Types.HeadObjectRequest>
  ): Promise<AWS.S3.HeadObjectOutput | undefined> {
    try {
      return await this.s3
        .headObject({
          Bucket: this.name,
          ...params,
        })
        .promise();
    } catch (e) {
      return undefined;
    }
  }

  async upload(
    params: OmitBucket<AWS.S3.Types.PutObjectRequest>
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      return await this.s3
        .upload({
          Bucket: this.name,
          ...params,
        })
        .promise();
    } catch (e: unknown) {
      throw new S3Error(e as AWSError);
    }
  }

  async getSignedUrl(
    params: OmitBucket<AWS.S3.Types.GetObjectRequest>
  ): Promise<string | undefined> {
    try {
      return await this.s3.getSignedUrlPromise("getObject", {
        Bucket: this.name,
        ...params,
      });
    } catch (e) {
      return undefined;
    }
  }
}

export default Bucket;
