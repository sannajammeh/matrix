import { AsyncLocalStorage } from "async_hooks";

export const globalStore = new AsyncLocalStorage<Store>();

export interface Store {
  argv: {
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
    force?: boolean;
  };
}

export const getGlobalStore = () => {
  const store = globalStore.getStore();
  if (!store) throw new Error("No store found");
  return store;
};
