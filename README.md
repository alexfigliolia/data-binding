# Data Binding
When using native web-components or basic DOM scripting, one of the largest pain-points is often resetting your DOM attributes to reflect new data after some user-behavior has taken place. 

Solutions such as UI frameworks have long-since solved this issue, but with web-components becoming more widely supported I decided to put together a small JavaScript library for adding reactivity to your components.

Reactivity is achieved through the use of signals - stateful values, that when changed, update the DOM in accordance to developer needs. By default DOM updates are batched using calls to `requestAnimationFrame` with a max number of operations per frame to ensure great performance.

## Basic Usage
To create a data-binding for a DOM node or attribute, import the `DataBinding` and pass it an initial value and a callback to run whenever the value changes:

```typescript
import { DataBinding } from "@figliolia/data-binding";

// Select a DOM node(s) with which to bind data
const paragraph = document.getElementById("#myParagraph");

// Create your binding with an initial value and an update function
const signal = new DataBinding(
  "some text", 
  (nextValue) => {
    paragraph.textContent = nextValue;
  }
);

// Update your DOM node's content
signal.update("Some new text!");

// Clean up your binding when you no longer need it
signal.destroy()
```

From here you can update your signal when your user clicks a new tab, an HTTP request for data resolves, or any behavior your application requires.

In addition to handing your DOM updates, each binding returns a `Signal` that you can treat as a `stateful` variable. Each `Signal` has the following API:

```typescript
const signal = new Signal(0);
// Get a signal's value
const currentValue = signal.value;

// update a signal's value
signal.update(signal.value + 1);

// subscribe to signal updates
const subscription = signal.subscribe(nextValue => {});

// unsubscribe to signal updates
subscription()
```

## Basic Examples
### A Counter Button
```typescript
import { DataBinding } from "@figliolia/data-binding";

class CounterButton extends HTMLElement {
  constructor() {
    super();
    this.node = document.createElement("button");
    this.increment = this.increment.bind(this);
    this.binding = new DataBinding(0, (nextValue) => {
      this.node.textContent = `${nextValue}`;
    });
  }

  connectedCallback() {
    this.appendChild(this.node);
    this.node.addEventListener("click", this.increment);
  }

  disconnectedCallback() {
    this.node.removeEventListener("click", this.increment);
    this.binding.destroy()
  }

  increment() {
    this.binding.update(this.binding.value + 1);
  }
}

window.customElements.define("counter-button", CounterButton);

/*
Usage:
<counter-button></counter-button>
*/
```

### A Dynamic Tabs Component
```typescript
import { DataBinding } from "@figliolia/data-binding";

class DynamicTabs extends HTMLElement {
  constructor() {
    super();
    this.buttons: HTMLButtonElement[] = [];
    this.onTabClick = this.onTabClick.bind(this);
    this.contentCache = new Map<string, string>();
    this.contentNode = document.createElement("p");
    this.contentSignal = new DataBinding("Loading...", content => {
      this.contentNode.textContent = content;
    })
  }

  connectedCallback() {
    const tabs = this.parseTabs();
    const { length } = tabs;
    for(let i = 0; i < length; i++) {
      const tab = tabs[i];
      const buttons = document.createElement("button");
      button.textContent = tab;
      if(i === 0) {
        button.classList.add("active");
        void this.fetchContent(tab);
      }
      button.addEventListener("click", this.onTabClick);
      this.buttons.push(button);
      this.appendChild(button);
    }
    this.appendChild(this.contentNode);
  }

  disconnectedCallback() {
    for(const button of this.buttons) {
      button.removeEventListener("click", this.onTabClick);
    }
    this.contentCache.clear();
    this.contentSignal.destroy();
  }

  onTabClick(e) {
    for(const tab of this.buttons) {
      if(tab !== e.target) {
        tab.classList.remove("active");
      } else {
        e.target.classList.add("active");
        void this.fetchContent(e.target.textContent);
      }
    }
  }

  fetchContent(tab) {
    if(this.contentCache.has(tab)) {
      return this.contentSignal.update(this.contentCache.get(tab));
    }
    this.contentSignal.update("Loading...");
    const param = tab.toLowerCase().replaceAll(" ", "-");
    fetch(`/api/tab-content?tab=${param}`).then(async (response) => {
      const data = await response.json();
      this.contentCache.set(tab, data.content);
      this.contentSignal.update(data.content);
    });
  } 
 
  parseTabs() {
    const tabs: string[] = [];
    let increment = 1;
    let tab = this.getAttribute(`tab${increment}`)
    while(tab) {
      tabs.push(tab);
      increment++;
      tab = this.getAttribute(`tab${increment}`)
    }
    return tabs;
  }
}

window.customElements.define("dynamic-tabs", DynamicTabs);

/*
Usage:
<dynamic-tabs 
  tab1="Tab 1" 
  tab2="Tab 2" 
  tab3="Tab 3">
</dynamic-tabs>
*/
```