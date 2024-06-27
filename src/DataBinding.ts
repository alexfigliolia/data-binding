import { CallStack } from "./CallStack";
import { Signal } from "./Signal";

export class DataBinding<T> extends Signal<T> {
  destroy: () => void;
  private modifier: (value: T) => void;
  private static callStack = new CallStack();
  constructor(initialValue: T, modifier: (value: T) => void) {
    super(initialValue);
    this.modifier = modifier;
    this.updateDOMNode(initialValue);
    this.destroy = this.subscribe(value => {
      this.updateDOMNode(value);
    });
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
