---
"@wbe/low-router": minor
---

Matcher returns params even if not matching

```ts
const path = "/base/:lang/a-propos/bar"
const matcher = createMatcher()
```

before:
```ts
expect(matcher(path, "/base/fr/a-propos/bar/b")).toEqual([false, null, null, null])
```

after:
```ts
expect(matcher(path, "/base/fr/a-propos/bar/b")).toEqual([false, { lang: "fr" }, {}, null])
```
