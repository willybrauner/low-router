import { Router } from "../lowRouterReact/Router.tsx"
import { Stack } from "../lowRouterReact/Stack.tsx"
import { useRouter } from "../lowRouterReact/useRouter.tsx"
import { routes } from "../routes.tsx"
import { useEffect } from "react"

export const About = () => {
  // const routerContext = useRouter()
  const subRoutes = routes.find((route) => route.name === "about").children
  const base = "/about"

  // useEffect(() => {
  //   console.log("subRoutes", subRoutes)
  // }, [])

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
  const { router, history } = useRouter()
  return (
    <nav>
      {routes?.map((route, index) => (
        <button
          key={index}
          children={route.name}
          onClick={() => {
            history.push(base + route.path)
          }}
        />
      ))}
    </nav>
  )
}
