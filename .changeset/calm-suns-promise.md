---
"@wbe/low-router-preact": minor
---

`getStaticProps` params returns `RouteContext` instead route `props` (#54)

before:

```ts
  {
    path: "/",
    getStaticProps: async (props, locale) => {}
  }

```

after:

```ts
  {
    path: "/",
    getStaticProps: async (context, locale) => {}
  }

```
