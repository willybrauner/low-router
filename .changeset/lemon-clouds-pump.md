---
"@wbe/low-router": minor
---

RouteContext returns relativePathname

RouteContext returns `relativePathname`. It's the compiled path of current router instance. 


```ts
export interface RouteContext<A = any, C extends RouterContext = RouterContext> {
  pathname: string
  params: RouteParams
  query: QueryParams
  hash: Hash
  base: string
  route: Route<A, C>
  parent: RouteContext<A, C> | null
+ relativePathname: string
}
```
