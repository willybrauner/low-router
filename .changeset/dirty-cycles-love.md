---
"@wbe/low-router": minor
---

## breaking change: Improve `resolve` and `onResolve` params.

`router.resolve()` and `onResolve()` option return now `{response, context}` object of the matching route.

before:
```js
router.resolve("/").then((res) => {
  // res: "Hello home!"
});
```
after:
```js
router.resolve("/").then(({ response, context }) => {
  // response: "Hello home!"
  // context: RouteContext interface
});
```

