---
"@wbe/low-router": minor
---

change local browserHistory listener params to object

Goal is to feat with the [remix history lib](https://github.com/remix-run/history/blob/dev/docs/api-reference.md#createbrowserhistory) api in order to switch to it easily, if needed.

before:

```ts
history.listen((location, action) => {})
```

after:

```ts
history.listen(({ location, action }) => {})
```
