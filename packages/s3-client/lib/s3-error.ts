import { AWSError } from "aws-sdk";

class S3Error extends Error {
  readonly detail: AWSError;

  constructor(error: AWSError) {
    super(error.message);
    this.detail = error;
  }
}

export default S3Error;
