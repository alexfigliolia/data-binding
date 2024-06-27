import { Subscriptable } from "./Subscriptable";
import type { Callback } from "./types";

export class CallStack extends Subscriptable<Callback> {
  public maxDepth: number;
  private stack: Callback[] = [];
  private currentFrame: number | null = null;
  constructor(maxDepth = 100) {
    super();
    this.maxDepth = maxDepth;
  }

  public subscribe(callback: Callback) {
    const ID = this.add(callback);
    return () => {
      this.remove(ID);
    };
  }

  public push(item: Callback) {
    this.stack.push(item);
    void Promise.resolve().then(() => this.flush());
    return this.maxDepth - this.stack.length;
  }

  private flush() {
    if (this.currentFrame) {
      return;
    }
    this.currentFrame = requestAnimationFrame(() => {
      let count = 0;
      while (this.stack.length && count < this.maxDepth) {
        void this.stack.pop()?.();
        count++;
      }
      this.currentFrame = null;
      if (this.stack.length !== 0) {
        return this.flush();
      }
      this.emit();
    });
  }
}
