import { FramePooler } from "@figliolia/frame-pooler";
import { Signal } from "./Signal";

export class DataBinding<T> extends Signal<T> {
  destroy: () => void;
  private modifier: (value: T) => void;
  private static callStack = new FramePooler(100);
  constructor(initialValue: T, modifier: (value: T) => void) {
    super(initialValue);
    this.modifier = modifier;
    this.updateDOMNode(initialValue);
    this.destroy = this.subscribe(value => {
      this.updateDOMNode(value);
    });
  }

  private updateDOMNode(value: T) {
    DataBinding.callStack.run(() => {
      try {
        this.modifier(value);
      } catch (error) {
        // silence
      }
    });
  }
}
