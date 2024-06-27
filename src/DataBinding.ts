import { CallStack } from "./CallStack";
import { Signal } from "./Signal";

export class DataBinding<T> {
  destroy: () => void;
  private signal: Signal<T>;
  private modifier: (value: T) => void;
  private static callStack = new CallStack();
  constructor(initialValue: T, modifier: (value: T) => void) {
    this.signal = new Signal<T>(initialValue);
    this.modifier = modifier;
    this.updateDOMNode(initialValue);
    this.destroy = this.signal.subscribe(value => {
      this.updateDOMNode(value);
    });
  }

  public get value() {
    return this.signal.value;
  }

  public update(value: T) {
    this.signal.update(value);
  }

  private updateDOMNode(value: T) {
    DataBinding.callStack.push(() => {
      try {
        this.modifier(value);
      } catch (error) {
        this.destroy();
      }
    });
  }
}
