# Low Router 🚐

`LowRouter` is a lightweight *(~=1.5Kb)* and zero dependency, low-level router implementation designed for use in nodejs, javascript or typescript applications. By default, `LowRouter` as no link with the browser history, but this repository provide a createBrowserHistory util ready to use.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [instance](#instance)
    - [resolve](#resolve)
    - [createUrl](#createurl)
    - [dispose](#dispose)
- [Options](#options)
- [handle history](#handle-history)
- [API](#api)
  - [LowRouter API](#lowrouter-api)
  - [Route](#route)
  - [routeContext](#routecontext)
  - [createBrowserHistory](#createbrowserhistory)
- [workflow](#workflow)
- [Credits](#credits)


## Installation

```shell
npm i @wbe/low-router
```

## Usage

### Instance

To create a new instance of the `LowRouter` class, you need to pass an array of route definitions to the constructor.

```javascript
import { LowRouter } from "@wbe/low-router";

const routes = [
  {
    path: "/",
    name: "home",
    action: () => "Hello home!"
  },
  {
    path: "/admin",
    name: "admin",
    action: () => "Hello admin!",
    children: [
      {
        path: "/config",
        name: "config",
        action: (context) => `Hello ${context.route.name}!` 
      },
      {
        path: "/user/:id",
        name: "user",
        action: (context) => `Hello user! with id ${context.params.id}`
      },      
    ]
  }
];

const router = new LowRouter(routes);
```

### resolve

The `resolve` method allows you to match a given pathname or route object to a defined route and execute its associated action. It returns a Promise that resolves with the action result.

```js
router.resolve("/").then((res) => {
  // res: "Hello home!"
});
```

Or, with an object param:
```js
router.resolve({ name: "user", params: { id: 123 } }).then(res => {
  // res: "Hello user! with id 123"
})
```

### createUrl

The `createUrl` method generates a URL based on a route name and optional parameters. 

```js
router.createUrl({ name: "config" }); 
// "/admin/config"
```

### dispose

The `dispose` method is used to clean up the router instance.

```js
router.dispose();
```


## Options

When creating a `LowRouter` instance, you can provide the following configuration options in the `options` object as second constructor argument:

- `base`: The base URL path for all routes. Defaults to `/`.
- `onInit`: A callback function to be called when the router is initialized.
- `onError`: A callback function to be called when no matching route is found during resolution.
- `onResolve`: A callback function to be called after a route's action has been executed successfully.
- `onDispose`: A callback function to be called when the router is disposed of using the `dispose` method.
- `debug`: Set to `true` to enable logging for debugging purposes.
- `pathToRegexFn`: Custom function to convert a route path to a regular expression. Defaults to the internal `pathToRegexp`. 

Callbacks are useful for global action:

````js
const router = new LowRouter(routes, { 
 onResolve: (context, response) => {
   // do something each time a new route is resolved
 }
});
````

## Handle history

Internal `createBrowserHistory` provide a way to interact with the browser's history and listen to changes in the URL. You can integrate this functionality with the `LowRouter` class to enable client-side routing with browser history support. 

```javascript
import { LowRouter, createBrowserHistory } from "@wbe/low-router";

// Create the router instance
const router = new LowRouter(routes, options);

// Create the browser history
const history = createBrowserHistory();

// Listen to history changes
const unlisten = history.listen(async (location, action) => {
  // Resolve the new location.pathname
  const response = await router.resolve(location.pathname)
  // Do something with the response...
});

// To push a new URL to the browser history
history.push("/foo");
history.push({ name: "bar", params: { id: 123 } });

// To stop listening to history changes, call the unlisten function
unlisten();
```

## Custom matcher

It's possible to use a custom `pathToRegexp` function:
TODO


## API

### LowRouter API

```ts
const router = new LowRouter(routes: Route[], options?: Options)

// Resolve a pathname or a route object
router.resolve(pathnameOrObject: string | { name: string; params: RouteParams }): Promise<any>

// Create a URL based on a route name and optional parameters
router.createUrl({ name: string; params?: RouteParams }): string

// Clean up the router instance
router.dispose(): void
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
  path: string;
  
  // The route name, useful to get a route by name
  name?: string;

  // The route action function is the main function of the route
  // this function is called when the route is resolved
  action?: (context: RouteContext) => Promise<any> | any;

  // The route children 
  children?: Route[];

  // The route props can be any data you want to pass/associate to the route
  props?: Record<string, any>;
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

## Credits

- [universal-router](https://github.com/kriasoft/universal-router/)
- [wouter](https://github.com/molefrog/wouter)
- [cher-ami/router](https://github.com/cher-ami/router)
- [history](https://github.com/remix-run/history)

© [Willy Brauner](https://willybrauner.com)
