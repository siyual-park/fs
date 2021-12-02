import { S3 } from "aws-sdk";
import Bucket from "./bucket";

class S3Client {
  private readonly s3: S3;

  constructor(options?: S3.Types.ClientConfiguration) {
    this.s3 = new S3(options);
  }

  bucket(name: string): Bucket {
    return new Bucket(this.s3, name);
  }
}

export default S3Client;
