<h1 align="center" style="text-align:center">low-router preact</h1>
<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@wbe/low-router-preact">
<img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/%40wbe%2Flow-router-preact">
<img alt="build" src="https://github.com/willybrauner/low-router-preact/workflows/tests/badge.svg">
</p>
<p align="center">

`Low-router preact` is an High level and opinionated Preact router based on [low-router](https://github.com/willybrauner/low-router).
It supports out of the box, SSR routing, nested router instances, I18n and route transitions manager.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Nested Routes](#nested-routes)
- [i18n](#i18n)
  - [setup](#i18n-setup)
  - [API](#i18n-api)
- [SSR](#ssr)
- [Components](#components)
  - [Router](#router)
  - [Stack](#stack)
  - [Link](#link)
- [Hooks](#hooks)
  - [useRouter](#userouter)
  - [useCreateRouter](#usecreaterouter)
- [Utils](#utils)
  - [setLocation](#setlocation)
- [Credits](#credits)

## Installation

```shell
npm i @wbe/low-router @wbe/low-router-preact
```

## Usage

To make it works, we need to:

- Create a routes list witch render a Route component depending on each path.
- Create a `LowRouter` instance & and a `browserHistory` give it as props to `<Router />` component.
- Add `<Stack />` in children of the Router instance.
- "forwardRef" each route components to make it handle by the Stack.

main.tsx:

```tsx
import { render } from "preact"
import { createBrowserHistory } from "@wbe/wbe-router"
import { Router } from "@wbe/low-router-preact"

// Prepare the routes list
const routes = [
  {
    name: "home",
    path: "/",
    action: () => Home,
  },
  {
    name: "about",
    path: "/about",
    action: () => About,
  },
]

// Pass the routes list as LowRouter param
const router = new LowRouter(routes)

// Prepare a browser history
const history = createBrowserHistory()

// Render the app wrapped by the Router
render(
  <Router router={router} history={history}>
    <App />
  </Router>,
  document.getElementById("root")
)
```

App.tsx

```tsx
import { Link, Stack } from "@wbe/low-router-preact"

export default function App() {
  return (
    <div>
      <nav>
        <Link to={{ name: "home" }}>{"home"}</Link>
        <Link to={{ name: "about" }}>{"about"}</Link>
      </nav>
      {/* Render current route here */}
      <Stack />
    </div>
  )
}
```

Home.tsx

```tsx
import { useRef, useImperativeHandle } from "preact/hooks"

const Home = (props, ref) => {
  const rootRef = useRef(null)

  // Each route need to attached name, DOM root, playIn & playOut to the forwarded ref.
  // The Stack use this forwarded ref in order to control the component.
  useImperativeHandle(
    ref,
    () => ({
      name: "Home",
      root: rootRef.current,
      playIn: () => customPlayIn(rootRef.current),
      playOut: () => customPlayOut(rootRef.current),
    }),
    []
  )
  return <div ref={rootRef}>Hello home!</div>
}

export default forwardRef(Home)
```

## Nested routes

`low-router` support nested routes, `low-router-preact` too!
Example of sub routing setup we will that be given to the LowRouter instance, like in the example above:

```tsx
// ...
const routes = [
  {
    name: "home",
    path: "/",
    action: () => Home,
  },
  {
    path: "/admin",
    name: "admin",
    action: () => Admin,
    children: [
      // this route is needed to render the parent component
      // without children routes in the nested router stack
      // it also possible to return a component on this root children root if needed
      {
        path: "/",
        name: "admin-nested-root-route",
      },
      {
        path: "/config",
        name: "config",
        action: () => Config,
      },
      {
        path: "/user/:id",
        name: "user",
        action: () => User,
      },
    ],
  },
]
```

Now we need to create a new `<Router/>` instance with its own `<Stack/>` component in order to render admin's children routes.

Admin.tsx

```tsx
import { useRef, useImperativeHandle } from "preact/hooks"

const Admin = (props, ref) => {
  // ...

  const subRouter = useCreateRouter({ from: "admin" })

  return (
    <div ref={rootRef}>
      Admin!
      <Router router={subRouter}>
        <div>
          <Link to={{ name: "config" }}>config</Link>
          <Link to={{ name: "user", params: { id: "1" } }}>user 1</Link>
          <Stack />
        </div>
      </Router>
    </div>
  )
}

export default forwardRef(Admin)
```

## i18n

### i18n setup

`i18n` for "internationalisation", is a built-in class used to manage different locales with the router.
Basically, it allows to switch from a locale to another and translate a path segment.

main.tsx

```tsx
const routes = [
  // ...
  {
    name: "about",
    path: "/about",
    // translates path fragment as you want
    translations: { en: "/about", fr: "/a-propos" },
    action: () => About,
  },
]

// Shared app base for I18n and LowRouter
const base = "/"

// Prepare locales list & create i18n instance
const locales = [{ code: "en" }, { code: "fr" }]
const i18n = new I18n(locales, { base, defaultLocaleInUrl: false })

// before giving routes to the router instance, we need to patch them by adding
// :locale params to each first level routes
const patchedRoutes = i18n.addLocaleParamToRoutes(routes)

// then, create the router instance
const router = new LowRouter(patchedRoutes, { base })

render(
  <Router i18n={i18n} router={router} history={createBrowserHistory()}>
    <App />
  </Router>,
  document.getElementById("root")
)
```

App.tsx

```tsx
import { Link, Stack, useRouter } from "@wbe/low-router-preact"

export default function App() {
  // Retrieve i18n instance from useRouter hook
  // to update the locale, get the currentLocale etc.
  const { i18n } = useRouter()
  return (
    <div>
      <button onClick={() => i18n.setLocale("fr")}>fr</button>
      <button onClick={() => i18n.setLocale("en")}>en</button>
      // ...
    </div>
  )
}
```

### i18n API

#### constructor

The `I18n` class constructor takes an array of locales and an optional options object

```ts
type Locale<T = any> = {
  code: T | string
  name?: string
  default?: boolean
}

declare class I18n<T = any> {
  constructor(
    locales: Locale<T>[],
    options?: Partial<{
      base: string
      defaultLocaleInUrl: boolean
      staticLocation: string
    }>
  )
}
```

#### Methods

```ts
const i18n = new I18n(locales, {});

// Add Locale to Routes, Patch all first level routes with ":locale" param
i18n.addLocaleParamToRoutes(locale: string): void

// change the current locale
i18n.setLocale(locale: string): void

// Redirect to the default locale
i18n.redirectToDefaultLocale(): void

// Redirect to the browser locale
i18n.redirectToBrowserLocale(): void
```

## SSR

TODO

## Components

### Router

This is the component orchestrating the routing logic thanks to the LowRouter instance passed as props.

```tsx
<Router router={new LowRouter(routes)} history={createBrowserHistory()}>
  ...
</Router>
```

#### props

- **routes**: `Route[]` - routes list
- **options**: `Partial<RouterOptions>` - router options
- **children**: `ReactElement` - main app component
- **history**: `HistoryAPI | any` - history instance ("any" because it can receive a custom history like "remix/history")
- **staticLocation**: `string` - static location passed to the main Router component if exist
- **i18n**: `I18n` - i18n instance if exist

### Stack

The Stack is a routes render manager. It receives routes information from the parent Router component
and manage the transitions between current and prev route.

#### props

- **transitions**: `(T: { prev: RouteRef; current: RouteRef; unmountPrev: () => void }) => Promise<void>` - custom transitions function
- **clampRoutesRender**: `boolean` - clamp Routes render number to two routes, prev & next

The cool thing is that you can pass a custom transitions function to the Stack component.

example:

```tsx
<Stack
  transitions={async ({ prev, current, unmountPrev }: StackTransitionsParams) => {
    if (current?.root) current.root.style.opacity = "0"
    prev?.playOut?.().then(unmountPrev)
    if (current?.root) current.root.style.opacity = "1"
    await current?.playIn?.()
  }}
/>
```

### Link

This is a simple link component that allows to navigate to a route by clicking on it.

```tsx
<Link to={{ name: "home" }}>{"home"}</Link>
<Link to="/about">{"about"}</Link>
```

#### props

- **to**: `string | { name: string; params?: RouteParams }` - route name or path
- **onClick**: `() => void` - custom click handler
- **className**: `string` - custom class name
- **children**: `ReactElement` - link content
- **ref**: `MutableRefObject<any>` - forwarded ref

## Hooks

### useRouter

Main router hook, it returns all current instance router information (IRouterContext).
Be careful on this point, some IRouterContext information are global between all Router instances, like the history, i18n.

```ts
const router = useRouter()
```

#### returns

- **prevContext**: `RouteContext` - previous route context
- **currentContext**: `RouteContext` - current route context
- **router**: `LowRouter` - current router instance
- **base**: `string` - base path
- **routes**: `Route[]` - current router routes
- **options**: `Partial<RouterOptions>` - current router options
- **history**: `HistoryAPI | any` - history instance ("any" because it can receive a custom history like "remix/history")
- **counter**: `number` - routes counter
- **staticLocation**: `string` - static location passed to the main Router component if exist
- **i18n**: `I18n` - i18n instance if exist

example:

```tsx
const App = () => {
  const { currentContext } = useRouter()
  return <div>{currentContext.route.name}</div>
}
```

### useCreateRouter

This hook facilitates the sub LowRouter instance creation, just by giving the route name from where
the new Router need to be instantiated.

```ts
const router = useCreateRouter({ from: "admin", id: 1 })
```

#### params

- **from**: `string` - route name
- **id**: `number | string` - router id

#### returns

- **router**: `LowRouter` - new router instance

## Utils

### setLocation

This utility function allows to navigate to a route by giving a route name or path.
It is useful when you need to navigate from a function or a custom event.

```ts
setLocation({ to: "blog", params: { id: "foo" } })
```

#### params

- **to**: `string | { name: string; params?: RouteParams }` - route name or path

## Credits

I originally wrote the main logic of this router on [@cher-ami/router](https://github.com/cher-ami/router).
LowRouter allowed me to separate the low level routing logic, from the "Framework usage wrapper" (react, preact etc).
This library is totally independent of his first cher-ami's version.

LICENCE MIT

© [Willy Brauner](https://willybrauner.com)
