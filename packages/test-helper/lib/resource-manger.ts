import Resource from "./resource";

class ResourceManager implements Resource {
  private readonly resources: Resource[] = [];

  use(...resources: Resource[]) {
    this.resources.push(...resources);
  }

  async init(): Promise<void> {
    for (const resource of this.resources) {
      await resource.init();
    }
  }

  async clear(): Promise<void> {
    for (const resource of this.resources.reverse()) {
      await resource.clear();
    }
  }
}

export default ResourceManager;
