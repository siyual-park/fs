/* eslint-disable max-len */

import * as stream from "stream";
import AWS, { AWSError } from "aws-sdk";
import {
  DeletedObjects,
  DeleteObjectsOutput,
  Errors,
  RequestCharged,
} from "aws-sdk/clients/s3";
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
  async deleteMany(
    params: OmitBucket<AWS.S3.Types.DeleteObjectsRequest>
  ): Promise<DeleteObjectsOutput> {
    const { Delete } = params;
    const { Objects: identifierList } = Delete;

    const partialIdentifierList: AWS.S3.Types.ObjectIdentifierList[] = _.chunk(
      identifierList,
      1000
    );

    const result = await Promise.all(
      partialIdentifierList.map(async (partition) => {
        try {
          return await this.s3
            .deleteObjects({
              Bucket: this.name,
              ...params,
              Delete: {
                ...Delete,
                Objects: partition,
              },
            })
            .promise();
        } catch (e: unknown) {
          throw new S3Error(e as AWSError);
        }
      })
    );

    const deleted: DeletedObjects = [];
    let requestCharged: RequestCharged | undefined = undefined;
    const errors: Errors = [];

    result.forEach((output) => {
      if (output.Deleted != null) {
        deleted.push(...output.Deleted);
      }
      requestCharged = output.RequestCharged;
      if (output.Errors != null) {
        errors.push(...output.Errors);
      }
    });

    return {
      Deleted: deleted.length === 0 ? undefined : deleted,
      RequestCharged: requestCharged,
      Errors: errors.length === 0 ? undefined : errors,
    };
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
