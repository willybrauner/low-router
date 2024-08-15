---
"@wbe/low-router": minor
---

extract compile path function

before:

```ts
LowRouter.compilePath(path)(params)
```

after:

```ts
compilePath(path)(params)
```

- compile base if it contains params in createUrl
