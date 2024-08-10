---
"@wbe/low-router": minor
---

Externalize compile path as static method.

ex:
```ts
LowRouter.compilePath("/foo/:id")({ id: "bar" })  // "/zoo/bar"
```
