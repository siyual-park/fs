interface Resource {
  init(): Promise<void>;
  clear(): Promise<void>;
}

export default Resource;
