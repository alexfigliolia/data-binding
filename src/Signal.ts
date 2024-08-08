import { Subscriptable } from "@figliolia/event-emitter";
import type { Observer } from "./types";

export class Signal<T> extends Subscriptable<Observer<T>> {
  value: T;
  constructor(value: T) {
    super();
    this.value = value;
  }

  public update(value: T) {
    this.value = value;
    this.execute(this.value);
  }

  public subscribe(observer: Observer<T>) {
    const ID = this.register(observer);
    return () => {
      this.remove(ID);
    };
  }

  public toJSON() {
    return this.value;
  }
}
