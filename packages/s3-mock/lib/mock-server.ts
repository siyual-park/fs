import * as AWS from "aws-sdk";
import uniqid from "uniqid";
import path from "path";
import S3rver from "s3rver";
import makeDir from "make-dir";
import del from "del";
import getPort from "get-port";

import { Resource } from "@internal/test-helper";

class MockServer implements Resource {
  private readonly serverConfig = {
    resetOnClose: true,
    port: NaN,
    hostname: "127.0.0.1",
    silent: false,
    directory: path.join(__dirname, `../tmp/${uniqid()}`),
  };

  private s3Server: S3rver | undefined;

  get clientConfig(): AWS.S3.ClientConfiguration {
    if (this.s3Server == null) {
      throw new Error("This resource must to be initialized.");
    }

    return {
      s3ForcePathStyle: true,
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
      endpoint: `http://${this.serverConfig.hostname}:${this.serverConfig.port}`,
    };
  }

  async init(): Promise<void> {
    await makeDir(this.serverConfig.directory);
    this.serverConfig.port = await getPort();
    this.s3Server = new S3rver(this.serverConfig);
    await this.s3Server.run();
  }

  async clear(): Promise<void> {
    await this.s3Server?.close();
    await del(this.serverConfig.directory, { force: true });
  }
}

export default MockServer;
