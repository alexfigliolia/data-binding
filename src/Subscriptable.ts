import { AutoIncrementingID } from "@figliolia/event-emitter";
import type { Callback } from "./types";

export class Subscriptable<T extends Callback> {
  private IDs = new AutoIncrementingID();
  private storage = new Map<string, T>();

  protected add(callback: T) {
    const ID = this.IDs.get();
    this.storage.set(ID, callback);
    return ID;
  }

  protected remove(ID: string) {
    return this.storage.delete(ID);
  }

  protected emit(...payload: Parameters<T>) {
    for (const [_, callback] of this.storage) {
      void callback(...payload);
    }
  }
}
