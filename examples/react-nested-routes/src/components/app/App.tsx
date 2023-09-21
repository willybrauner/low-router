import "./App.css"
import { useEffect, useRef, useState } from "react"
import { historyPlugin, Router } from "@wbe/low-router"
import { Home } from "../../pages/Home.tsx"
import { About } from "../../pages/About.tsx"

function App() {
  const router = useRef<Router>(null)
  const routes = [
    {
      path: "/",
      name: "home",
      action: () => <div>home</div>,
    },
    {
      path: "/about",
      name: "about",
      action: About,
      children: [
        {
          path: "",
        },
        {
          path: "/foo",
          name: "foo",
          action: () => <div>foo</div>,
        },
        {
          path: "/bar",
          name: "bar",
          action: () => <div>bar</div>,
        },
      ],
    },
  ]

  // store the component to render
  const [component, setComponent] = useState(null)

  useEffect(() => {
    router.current = new Router(routes, {
      debug: true,
      plugins: [historyPlugin],
      onResolve: (context, actionResult) => {
        setComponent(actionResult)
      },
    })
  }, [])

  return (
    <div>
      {/* NAV */}
      <nav>
        {routes.map((route, index) => (
          <button
            key={index}
            children={route.name}
            onClick={() => {
              router.current?.resolve(route.path)
            }}
          />
        ))}
      </nav>

      {/* RENDER */}
      <div className={"page"}>{component}</div>
    </div>
  )
}

export default App
