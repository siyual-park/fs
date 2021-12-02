import { useResource } from "@internal/test-helper";

import { MockServer } from "../lib";

const mockServer = new MockServer();
useResource(mockServer, { initAll: false });

describe("MockServer", () => {
  test("clientConfig", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    mockServer.clientConfig;
  });
});
