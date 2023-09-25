import { Router } from "../lowRouterReact/Router.tsx"
import { Stack } from "../lowRouterReact/Stack.tsx"
import { useRouter } from "../lowRouterReact/useRouter.tsx"
import { routes } from "../routes.tsx"
import { useEffect } from "react"
import { historyPlugin } from "@wbe/low-router"

export const About = () => {
  // const routerContext = useRouter()
  const subRoutes = routes.find((route) => route.name === "about").children
  const base = "/about"

  useEffect(() => {
    console.log("subRoutes", subRoutes)
  }, [])

  return (
    <div>
      <span>About</span>
      <Router routes={subRoutes} options={{ debug: true, base, id: 2 }}>
        <>
          <AboutNav routes={subRoutes} base={base} />
          <Stack />
        </>
      </Router>
    </div>
  )
}

const AboutNav = ({ routes, base }) => {
  const { router } = useRouter()
  return (
    <nav>
      {routes?.map((route, index) => (
        <button
          key={index}
          children={route.name}
          onClick={() => {
            router.resolve(base + route.path)
          }}
        />
      ))}
    </nav>
  )
}
