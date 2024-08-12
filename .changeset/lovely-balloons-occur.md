---
"@wbe/low-router": patch
---

expose options

`options` are now a public value, in order to get them from the instance.

```ts
const router = new LowRouter(routes, options)
console.log(router.options) // {...}
```
