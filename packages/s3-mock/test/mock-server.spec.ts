import { useResource } from "@internal/test-helper";

import { MockServer } from "../lib";

const mockServer = new MockServer();
useResource(mockServer, { initAll: false });

describe("MockServer", () => {
  test("server initialized", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    mockServer.clientConfig;
  });
});
