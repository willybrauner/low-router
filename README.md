# LowRouter

`LowRouter` is a lightweight (~=1.5Kb) and zero dependency, low-level router implementation designed for use in nodejs, javascript or typescript applications.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Constructor](#constructor)
    - [resolve](#resolve)
    - [createUrl](#createurl)
    - [dispose](#dispose)
- [Options](#options)
- [handle history](#handle-history)
- [workflow](#workflow)
- [Credits](#credits)


## Installation

```shell
npm i @wbe/low-router
```

## Usage

### Constructor

To create a new instance of the `LowRouter` class, you need to pass an array of route definitions to the constructor. Optionally, you can provide configuration options. Here's an example of how to create a `LowRouter` instance:

```javascript
import { LowRouter } from "low-router";

const routes = [
  {
    path: "/",
    name: "home",
    action: () => "Hello home!"
  },
  {
    path: "/foo",
    name: "foo",
    action: () => "Hello foo!",
    children: [
      {
        path: "/a",
        name: "a",
        action: (context) => `Hello ${context.route.name}!` 
      },
      {
        path: "/b/:id",
        name: "b",
        action: (context) => `Hello b! w/ id ${context.params.id}`
      },      
    ]
  }
];

const router = new LowRouter(routes);
```

### resolve

The `resolve` method allows you to match a given pathname or route object to a defined route and execute its associated action. It returns a Promise that resolves with the action result. Here's how to use it:

```javascript
router.resolve("/").then((res) => {
  console.log(res) // -> "Hello home!"
});

// or with param object
router.resolve({ name: "b", params: { id: 123 } }).then(res => {
  console.log(res) // -> "Hello b! w/ id 123"
})
```

### createUrl

The `createUrl` method generates a URL based on a route name and optional parameters. 

```javascript
const url = router.createUrl({ name: "b", params: { id: 123 } });
// -> "/foo/b/123"
```

### dispose

The `dispose` method is used to clean up the router. You can call this method when you no longer need the router instance. It can be useful for cleaning up any resources or event listeners associated with the router.

```javascript
router.dispose();
```


## Options

When creating a `LowRouter` instance, you can provide the following configuration options in the `options` object:

- `base`: The base URL path for all routes. Defaults to `/`.
- `onInit`: A callback function to be called when the router is initialized.
- `onError`: A callback function to be called when no matching route is found during resolution.
- `onResolve`: A callback function to be called after a route's action has been executed successfully.
- `onDispose`: A callback function to be called when the router is disposed of using the `dispose` method.
- `debug`: Set to `true` to enable logging for debugging purposes.
- `pathToRegexFn`: Custom function to convert a route path to a regular expression. Defaults to the internal `path-to-regexp`. 

Callbacks are useFull for global action:

````js
const router = new LowRouter(routes, { 
 onResolve: (context, actionResponse) => {
   // do something each time a new route is resolved
 } 
});
````

## Handle history

Internal `createBrowserHistory` provide a way to interact with the browser's history and listen to changes in the URL. You can integrate this functionality with the `LowRouter` class to enable client-side routing with browser history support. 

First, you need to import the necessary types and functions:

```javascript
import { createBrowserHistory } from "@wbe/low-router"; 
```

Then, let's create a browser history instance and use it with the `LowRouter`:

```javascript
const router = new LowRouter(routes, options);

const history = createBrowserHistory();

const unlisten = history.listen((location, action) => {
  // When the URL changes, resolve the new URL using LowRouter
  router.resolve(location.pathname).then((res) => {
    // Handle the action result if needed
  });
});

// To push a new URL to the browser history
history.push("/foo");
history.push({ name: "bar", params: { id: 123 } });

// To stop listening to history changes, call the unlisten function
unlisten();
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

- [cher-ami/router](https://github.com/cher-ami/router)
- [universal-router](https://github.com/kriasoft/universal-router/)
- [history](https://github.com/remix-run/history)

© [Willy Brauner](https://willybrauner.com)
