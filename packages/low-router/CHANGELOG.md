# @wbe/low-router

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
