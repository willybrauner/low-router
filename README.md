<h1 align="center" style="text-align:center">low-router 🚌‍</h1>
<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@wbe/low-router">
<img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/%40wbe%2Flow-router">
<img alt="build" src="https://github.com/willybrauner/low-router/workflows/tests/badge.svg">
</p>
<p align="center">

`LowRouter` is a lightweight _(~=1.8Kb)_, low-level router implementation designed for use in nodejs, javascript or typescript applications. By default, `LowRouter` has no link with the browser history, but this repository provide a `createBrowserHistory` util ready to use. It also includes a `createMatcher` function to convert a route path to a regular expression, but still open to use a custom one.

## Table of Contents

- [Playground](#playground)
- [Installation](#installation)
- [Usage](#usage)
  - [instance](#instance)
  - [resolve](#resolve)
  - [resolveSync](#resolvesync)
  - [createUrl](#createurl)
  - [dispose](#dispose)
- [Handle history](#handle-history)
- [Matcher](#matcher)
- [Custom matcher](#custom-matcher)
- [API](#api)
  - [LowRouter](#lowrouter)
  - [options](#options)
  - [Route](#route)
  - [RouteContext](#routecontext)
  - [createBrowserHistory](#createbrowserhistory)
- [workflow](#workflow)
- [Acknowledgement](#acknowledgement)
- [Credits](#credits)

## Playground

The examples of this repo are available on codesandbox:

- [basic](https://codesandbox.io/s/github/willybrauner/low-router/tree/main/examples/basic)
- [basic-resolve-sync](https://codesandbox.io/s/github/willybrauner/low-router/tree/main/examples/basic-resolve-sync)
- [compose](https://codesandbox.io/s/github/willybrauner/low-router/tree/main/examples/compose)
- [custom-matcher](https://codesandbox.io/s/github/willybrauner/low-router/tree/main/examples/custom-path-to-regexp)
- [react-nested-routes](https://codesandbox.io/s/github/willybrauner/low-router/tree/main/examples/react-nested-routes)

## Installation

```shell
npm i @wbe/low-router
```

## Usage

### Instance

```javascript
import { LowRouter } from "@wbe/low-router"

const routes = [
  {
    path: "/",
    name: "home",
    action: () => "Hello home!",
  },
  {
    path: "/admin",
    name: "admin",
    action: () => "Hello admin!",
    children: [
      {
        path: "/config",
        name: "config",
        action: (context) => `Hello ${context.route.name}!`,
      },
      {
        path: "/user/:id",
        name: "user",
        action: (context) => `Hello user! with id ${context.params.id}`,
      },
    ],
  },
]

const router = new LowRouter(routes)
```

### resolve

The `resolve` method allows you to match a given pathname or route object to a defined route and execute its associated action. It returns a Promise that resolves with the action result and route context.

```js
router.resolve("/").then(({ response, context }) => {
  // response: "Hello home!"
})
```

Or, with an object param:

```js
router.resolve({ name: "user", params: { id: 123 } }).then(({ response, context }) => {
  // response: "Hello user! with id 123"
})
```

### resolveSync

The `resolveSync` method is the same than resolve, but synchronously. It returns the action result and route context directly.

```js
const { response, context } = router.resolveSync("/admin/config")
// response: "Hello home!"
```

Or, with an object param:

```js
const { response, context } = router.resolveSync({ name: "user", params: { id: 123 } })
// response: "Hello user! with id 123"
```

### createUrl

The `createUrl` method generates a URL based on a route name and optional parameters.

```js
router.createUrl({ name: "config" })
// "/admin/config"
```

### dispose

The `dispose` method is used to clean up the router instance.

```js
router.dispose()
```

## Handle history

Internal `createBrowserHistory` provide a way to interact with the browser's history and listen to changes in the URL. You can integrate this functionality with the `LowRouter` class to enable client-side routing with browser history support.

```javascript
import { LowRouter, createBrowserHistory } from "@wbe/low-router"

const router = new LowRouter(routes, options)
const history = createBrowserHistory()

const unlisten = history.listen(async (location, action) => {
  const response = await router.resolve(location.pathname)
  // Do something with the response...
})

// Push to the browser history will trigger the router resolve method
history.push("/foo")
history.push(router.createUrl({ name: "bar", params: { id: 123 } }))

// Stop listening to history changes
unlisten()
```

On the same way, you can use every history lib you want to handle history changes, and resolve
the new pathname with the router, like [remix-run/history](https://github.com/remix-run/history).

## Matcher

The `matcher` is the function used to convert a route path to a regular expression. By default, `LowRouter` use an [internal matcher function](packages/low-router/src/createMatcher.ts). this matcher is called when the resolve method is called. You shouldn't have to use this function directly, but it's interesting to understand how it works, specially if you need to use a custom one.

```ts
import { createMatcher } from "@wbe/low-router"

const matcher = createMatcher()
const [isMatch, routeParams, queryParams, hash] = matcher(
  "/user/1?lang=fr&cat=foo#section-2",
  "/user/:id"
)
// isMatch: true
// routeParams: { id: "1" }
// queryParams: { lang: "fr", cat: "foo" }
// hash: "section-2"
```

This returns values are returned by `RouteContext` when the route match. For more information about the matcher full matcher API, read the [createMatcher unit tests](packages/low-router/tests/createMatcher.test.ts).

## Custom matcher

If the internal matcher doesn't respond as needed, it's possible to use a custom matcher function:
like the original [path-to-regexp package](https://github.com/pillarjs/path-to-regexp).

```ts
import { LowRouter, createMatcher } from "@wbe/low-router"
import { pathToRegexp } from "path-to-regexp"

const customPathToRegexpFn = (path: string): { keys: Record<string, string>[]; regexp: RegExp } => {
  let keys = []
  const regexp = pathToRegexp(path, keys)
  return { keys, regexp }
}

const customMatcher = createMatcher(customPathToRegexpFn)
// ex: customMatcher("/about/:id", "/about/1")
// return: [true, { id: "1" }, {}, null]

// then, pass this customMatcher to the router options
// Now, the router will use this custom matcher with path-to-regexp to match routes
const router = new LowRouter(routes, { matcher: customMatcher })
```

This flexible custom matcher pattern as been created by [molefrog](https://github.com/molefrog) on [wouter](https://github.com/molefrog/wouter) 🙏

## API

### LowRouter

```ts
// LowRouter(routes: Route[], options?: Options)
const router = new LowRouter(routes, options)

// Resolve a pathname or a route object
// resolve(pathnameOrObject: string | { name: string; params?: RouteParams })
router.resolve(path)
router.resolve({ name: "", params: {} })

// Resolve synchronously
// resolveSync(pathnameOrObject: string | { name: string; params?: RouteParams })
router.resolveSync(path)
router.resolveSync({ name: "", params: {} })

// Create a URL based on a route name and optional parameters
// createUrl({ name: string; params?: RouteParams }): string
router.createUrl({ name: "", params: {} })

// Clean up the router instance
// dispose(): void
router.dispose()
```

### Options

```ts
const options: Options = {
  // The base URL path for all routes.
  // default: `/`.
  base: "/",

  // called when the router is initialized
  // onInit: () => void
  onInit: () => {},

  // called when no matching route is found during resolution
  // onError: () => void
  onError: (context, error) => {},

  // called after a route's action has been executed successfully
  // onResolve: ({response: ActionResponse<A>, context: RouteContext<A, P>}) => void
  onResolve: ({ response, context }) => {},

  // called when the router is disposed of using the `dispose` method
  // onDispose: () => void
  onDispose: () => {},

  // Custom function to convert a route path to a regular expression.
  // Default: the internal `createMatcher()` fn
  // matcher: Matcher
  matcher: createMatcher(),

  // give an id to the router instance, useful when you have multiple router instances
  // and you want to identify them from debug logs
  // id?: number | string
  id: 1,
}
```

### RouteContext

`RouteContext` is the 1st level route object, passed to the route action function.
It contains all the information about the current context, plus the route object itself.

```ts
interface RouteContext {
  // The current pathname
  pathname: string

  // The current path params
  // (ex: /:foo/:bar)
  params: RouteParams

  // The current query params
  // (ex: ?foo=bar&baz=qux)
  query: QueryParams

  // The current hash
  // (ex: #foo)
  hash: Hash

  // the route base URL
  base: string

  // → the route object associated to this context
  route: Route

  // parent route context, useful when the current is a child route
  parent: RouteContext | null
}
```

### Route

`Route` is the route object definition passed to the `LowRouter` constructor, define by the developer.

```ts
interface Route {
  // The route path
  // (ex: /foo/:bar)
  path: string

  // The route name, useful to get a route by name
  name?: string

  // The route action function is the main function of the route
  // this function is called when the route is resolved
  action?: (context: RouteContext) => Promise<any> | any

  // The route children
  children?: Route[]

  // The route props can be any data you want to pass/associate to the route
  props?: Record<string, any>
}
```

### createBrowserHistory

`createBrowserHistory()` will return an object:

```ts
export interface HistoryAPI {
  // associate a callback to the history change event
  // return a function to stop listening
  listen: (callback: (location: Location, action: Action) => void) => () => void

  // Push a new patname to the history
  push: (pathname: string) => void
}
```

## Workflow

```shell
# clone repo
git clone {repo}

# install all dependencies
pnpm i

# run build watch
pnpm run build:watch

# run test watch
pnpm run test:watch

# run examples dev server
pnpm run dev
```

## Acknowledgement

This project is inspired by the following projects:

- [universal-router](https://github.com/kriasoft/universal-router/)
- [wouter](https://github.com/molefrog/wouter)
- [history](https://github.com/remix-run/history)

## Credits

© [Willy Brauner](https://willybrauner.com)
