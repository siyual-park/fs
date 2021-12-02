import Resource from "./resource";

function useResource(resource: Resource, config?: { initAll?: boolean }): void {
  const initAll = config?.initAll ?? true;

  if (initAll) {
    beforeAll(async () => {
      await resource.init();
    });

    afterAll(async () => {
      await resource.clear();
    });
  } else {
    beforeEach(async () => {
      await resource.init();
    });

    afterEach(async () => {
      await resource.clear();
    });
  }
}

export default useResource;
