import { Router } from "../lowRouterReact/Router.tsx"
import { Stack } from "../lowRouterReact/Stack.tsx"
import { useRouter } from "../lowRouterReact/useRouter.tsx"
import { routes } from "../routes.tsx"
import { createBrowserHistory } from "@wbe/low-router"

export const About = () => {
  const { history, routes } = useRouter()
  const subRoutes = routes.find((route) => route.name === "about").children
  const base = "/about"

  return (
    <div>
      <span>About</span>
      <Router routes={subRoutes} options={{ base, debug: true, id: 2 }}>
        <>
          <AboutNav />
          <Stack />
        </>
      </Router>
    </div>
  )
}

const AboutNav = () => {
  const { history, routes, router } = useRouter()

  return (
    <nav>
      {routes?.map((route, index) => (
        <button
          key={index}
          children={route.name}
          onClick={() => {
            history.push("/about" + route.path)
          }}
        />
      ))}
    </nav>
  )
}
