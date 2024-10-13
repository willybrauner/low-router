# @wbe/low-router-preact

## 0.6.0

### Minor Changes

- 865c942: Improve getStaticProps in case we request the same route object differently on server & client.

## 0.5.0

### Minor Changes

- ec4a034: `getStaticProps` params returns `RouteContext` instead route `props` (#54)

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

## 0.4.0

### Minor Changes

- cfb9bf4: Allow augmented Route & RouteContext interfaces

## 0.3.0

### Minor Changes

- 193e647: Prevent hash pathname on server to avoid '/undefined' as matching route

## 0.2.0

### Minor Changes

- cd68512: Internalize preact dependencies in bundle

## 0.1.0

### Minor Changes

- 4e31d18: Low router preact wrapper first release.

  ## Usage example

  (check the readme for more information)

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
    document.getElementById("root"),
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
      [],
    )
    return <div ref={rootRef}>Hello home!</div>
  }

  export default forwardRef(Home)
  ```
