# LowRouter

LowRouter is a lightweight (~=1.5Kb) low-level router implementation designed for use in nodejs, javascript or typescript applications.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Constructor](#constructor)
    - [resolve](#resolve)
    - [dispose](#dispose)
    - [matchRoute](#matchroute)
    - [createUrl](#createurl)
- [Options](#options)
- [Debug](#debug)
- [handle history](#handle-history)
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
    action: () => "Hello home!"
  },
  {
    path: "/foo",
    action: () => "Hello foo!"
  }
];

const router = new LowRouter(routes);
```

### resolve

The `resolve` method allows you to match a given pathname or route object to a defined route and execute its associated action. It returns a Promise that resolves with the action result. Here's how to use it:

```javascript
router.resolve("/").then((actionResult) => {
  console.log(actionResult) // -> "Hello home!"
});
```

### dispose

The `dispose` method is used to clean up the router. You can call this method when you no longer need the router instance. It can be useful for cleaning up any resources or event listeners associated with the router.

```javascript
router.dispose();
```

### matchRoute

The `matchRoute` method is used internally to match a given pathname to a defined route. You can use this method if you need to perform custom route matching outside of the `resolve` method. It returns a `RouteContext` object if a matching route is found, or `undefined` otherwise.

```javascript
const routeContext = router.matchRoute("/example-route");
if (routeContext) {
  // Handle the matching route context
}
```

### createUrl

The `createUrl` method generates a URL based on a route name and optional parameters. This is useful for creating links within your application.

```javascript
const url = router.createUrl({ name: "example-route", params: { id: 123 } });
// The generated URL will be something like "/example-route/123"
```

## Options

When creating a `LowRouter` instance, you can provide the following configuration options in the `options` object:

- `base`: The base URL path for all routes. Defaults to `/`.
- `onInit`: A callback function to be called when the router is initialized.
- `onError`: A callback function to be called when no matching route is found during resolution.
- `onResolve`: A callback function to be called after a route's action has been executed successfully.
- `onDispose`: A callback function to be called when the router is disposed of using the `dispose` method.
- `debug`: Set to `true` to enable logging for debugging purposes.

## debug

The `LowRouter` class includes debug. You can enable debugging by setting the `debug` option to `true` when creating the router instance. The router will then log information to the console to help you trace its behavior.

```javascript
const router = new LowRouter(routes, { debug: true });
```

When debugging is enabled, you'll see log messages in the console prefixed with "low-router," helping you track the router's actions and behavior.

That's the basic usage and configuration of the `LowRouter` class. You can now start using it to handle routing in your web application.


# Handle history

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
  router.resolve(location.pathname).then((actionResult) => {
    // Handle the action result if needed
  });
});
// To push a new URL to the browser history
history.push("/foo");
history.push({ name: "bar", params: { id: 123 } });
// To stop listening to history changes, call the unlisten function
unlisten();
```

## Credits

- [cher-ami/router](https://github.com/cher-ami/router)
- [universal-router](https://github.com/kriasoft/universal-router/)
- [history](https://github.com/remix-run/history)
