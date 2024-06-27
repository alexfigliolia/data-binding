export type Callback<T extends any[] = never[]> = (
  ...args: T
) => void | Promise<void>;

export type Observer<T> = Callback<[value: T]>;
