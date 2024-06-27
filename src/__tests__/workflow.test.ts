import { DataBinding } from "../DataBinding";

describe("Workflow", () => {
  beforeAll(() => {
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((cb: (time: number) => void) => {
        void Promise.resolve().then(() => {
          cb(5);
        });
        return 5;
      });
  });

  it("Binds data to HTML attributes", async () => {
    const node = document.createElement("button");
    const binding = new DataBinding(0, nextValue => {
      node.textContent = `${nextValue}`;
    });
    const increment = () => {
      binding.update(binding.value + 1);
    };
    node.addEventListener("click", increment);
    document.body.appendChild(node);
    await new Promise<void>(resolve => {
      const listener = DataBinding["callStack"].subscribe(() => {
        expect(node.textContent).toEqual("0");
        expect(binding.value).toEqual(0);
        listener();
        resolve();
      });
    });
    node.click();
    await new Promise<void>(resolve => {
      const listener = DataBinding["callStack"].subscribe(() => {
        expect(node.textContent).toEqual("1");
        expect(binding.value).toEqual(1);
        listener();
        resolve();
      });
    });
  });
});
