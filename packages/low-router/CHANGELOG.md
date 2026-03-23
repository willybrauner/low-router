# @wbe/low-router

## 0.10.2

### Patch Changes

- bddb05a: Update the repository
  - Bump all dependencies
  - Remove turbo
  - Update examples

## 0.10.1

### Patch Changes

- 21bb6d0: Try catch compilePath to avoid errors

## 0.10.0

### Minor Changes

- 50c1e3e: Add compilePath as constructor option
  - Make `compilePath` configurable via `RouterOptions`, following the same pattern as `matcher`
  - Align internal `compilePath` regex with `pathToRegexp` to support all param modifiers (`?`, `+`, `*`)
  - Export `CompilePath` type for custom implementations
  - Fix the path-to-regexp example

  ## Usage

  Swap the built-in compile function with any lib that shares the same signature:

  ```ts
  import { compile } from "path-to-regexp"

  const router = new LowRouter(routes, {
    matcher: customMatcher,
    compilePath: compile,
  })
  ```

  Catch-all / 404 route:

  ```ts
  const routes = [
    { path: "/home", name: "home" },
    { path: "/:path*", name: "notFound" },
  ]

  router.matchRoute("/unknown")
  // → { params: { path: "unknown" }, route: { name: "notFound" } }
  ```

## 0.9.0

### Minor Changes

- 8529535: Matcher returns params even if not matching

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

- 7018e00: nomalize path

  Create normalize path helper to get a formatted and constant path format.

  ```ts
  path
    // remove multiples slashes
    ?.replace(/(https?:\/\/)|(\/)+/g, "$1$2")
    // remove trailing slash
    .replace(/\/$/, "") ||
    // add trailing slash if path is empty
    "/"
  ```

  `normalizePath(path) => string` is available : `import { normalizePath } from "@wbe/low-router`

## 0.8.1

### Patch Changes

- 2abc0f7: export compilePath

  Add missing `compilePath` export in `index.ts`

## 0.8.0

### Minor Changes

- e5eca20: extract compile path function

  before:

  ```ts
  LowRouter.compilePath(path)(params)
  ```

  after:

  ```ts
  compilePath(path)(params)
  ```

  - compile base if it contains params in createUrl

- 71279f3: extract compilePath static method as external function

## 0.7.0

### Minor Changes

- 1cd1608: change local browserHistory listener params to object

  Goal is to feat with the [remix history lib](https://github.com/remix-run/history/blob/dev/docs/api-reference.md#createbrowserhistory) api in order to switch to it easily, if needed.

  before:

  ```ts
  history.listen((location, action) => {})
  ```

  after:

  ```ts
  history.listen(({ location, action }) => {})
  ```

- 74f5122: Cleanup type generics

### Patch Changes

- b2efc1d: expose options

  `options` are now a public value, in order to get them from the instance.

  ```ts
  const router = new LowRouter(routes, options)
  console.log(router.options) // {...}
  ```

## 0.6.0

### Minor Changes

- 358bae8: RouteContext returns relativePathname

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

## 0.5.0

### Minor Changes

- 5035b82: Externalize compile path as static method.

  ex:

  ```ts
  LowRouter.compilePath("/foo/:id")({ id: "bar" }) // "/zoo/bar"
  ```

## 0.4.0

### Minor Changes

- 4ce916c: Install [@wbe/debug](https://github.com/willybrauner/debug) dependency
  - browser debug:

    ```shell
    localStorage.debug = "low-router:*"
    ```

  - Node debug:

    ```shell
    DEBUG=low-router:*
    ```

## 0.3.0

### Minor Changes

- e02a7f3: Create resolveSync method

  Resolve a route synchronously. It returns response and context without promise.

  ```ts
  const { response, context } = router.resolveSync("/foo")
  ```

## 0.2.0

### Minor Changes

- c98cc80: ## breaking change: Improve `resolve` and `onResolve` params.

  `router.resolve()` and `onResolve()` option return now `{response, context}` object of the matching route.

  before:

  ```js
  router.resolve("/").then((res) => {
    // res: "Hello home!"
  })
  ```

  after:

  ```js
  router.resolve("/").then(({ response, context }) => {
    // response: "Hello home!"
    // context: RouteContext interface
  })
  ```

## 0.1.1

### Patch Changes

- 7b8d0d6: Rework types

## 0.1.0

### Minor Changes

- a6f0d1f: first release
