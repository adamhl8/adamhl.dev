---
title: "JavaScript Arrow Function 'this' Binding"
date: 2024-10-14
tags: [TypeScript, JavaScript]
---

> [!tldr] JS Arrow Function 'this' Binding
> Arrow functions create a permanent link to the surrounding lexical scope through a mechanism called "lexical `this`".
>
> - They form a closure over the current scope, including the value of `this`.

Example:

```typescript
class Example {
  constructor() {
    this.value = 42
  }

  regularMethod() {
    console.log(this.value) // 'this' depends on how it's called
  }

  arrowMethod = () => {
    console.log(this.value) // 'this' is always the instance of Example
  }
}

const ex = new Example()
const regular = ex.regularMethod
const arrow = ex.arrowMethod

regular() // undefined (or throws error in strict mode)
arrow() // 42
```

- `regularMethod` loses its `this` context when assigned to a variable.
- `arrowMethod` retains its `this` context because it was bound to the instance when the arrow function was created.
