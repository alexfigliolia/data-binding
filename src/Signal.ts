import { Subscriptable } from "./Subscriptable";
import type { Observer } from "./types";

export class Signal<T> extends Subscriptable<Observer<T>> {
  value: T;
  constructor(value: T) {
    super();
    this.value = value;
  }

  public update(value: T) {
    this.value = value;
    this.emit(this.value);
  }

  public subscribe(observer: Observer<T>) {
    const ID = this.add(observer);
    return () => {
      this.remove(ID);
    };
  }

  public toJSON() {
    return this.value;
  }
}
