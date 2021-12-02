import { S3 } from "aws-sdk";
import Bucket from "./bucket";

class S3Client {
  private readonly s3: S3;

  constructor(options?: S3.Types.ClientConfiguration) {
    this.s3 = new S3(options);
  }

  async bucket(name: string): Promise<Bucket> {
    const { Buckets: buckets } = await this.listBuckets();
    const existsBucket =
      buckets?.some((bucket) => bucket.Name === name) ?? false;
    if (!existsBucket) {
      throw new Error("Bucket is not exists.");
    }

    return new Bucket(this.s3, name);
  }

  async buckets(): Promise<Bucket[]> {
    const { Buckets: buckets } = await this.listBuckets();
    if (buckets == null) {
      return [];
    }

    return buckets
      .map((bucket) => bucket.Name)
      .filter((name) => name != null)
      .map((name) => new Bucket(this.s3, name!));
  }

  private listBuckets(): Promise<S3.ListBucketsOutput> {
    return this.s3.listBuckets().promise();
  }
}

export default S3Client;
