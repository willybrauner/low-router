import { Router } from "../lowRouterReact/Router.tsx"
import { Stack } from "../lowRouterReact/Stack.tsx"
import { useRouter } from "../lowRouterReact/useRouter.tsx"

export const About = () => {
  const { history, routes } = useRouter()
  const subRoutes = routes.find((route) => route.name === "about").children
  const base = "/about"

  return (
    <div>
      <span>about</span>
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
      {routes
        .filter((e) => e.path !== "")
        ?.map((route, index) => (
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
