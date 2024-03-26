---
"@wbe/low-router": minor
---

Create resolveSync method

Resolve a route synchronously. It returns response and context without promise.

```ts
 const { response, context } = router.resolveSync("/foo")
```
