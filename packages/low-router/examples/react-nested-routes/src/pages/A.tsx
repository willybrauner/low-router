import { Router } from "../lowRouterReact/Router.tsx"
import { Stack } from "../lowRouterReact/Stack.tsx"
import { useRouter } from "../lowRouterReact/useRouter.tsx"
import { routes } from "../routes.tsx"

export const A = () => {
  const { history } = useRouter()
  const subRoutes = routes
    .find((route) => route.name === "about")
    .children.find((route) => route.name === "foo")
    .children.find((route) => route.name === "a").children
  const base = "/about/foo/a"

  return (
    <div>
      <span>a</span>
      <Router routes={subRoutes} options={{ base, id: 4 }}>
        <>
          <nav>
            {subRoutes.filter(e => e.path !== "")?.map((route, index) => (
              <button
                key={index}
                children={route.name}
                onClick={() => {
                  history.push(base + route.path)
                }}
              />
            ))}
          </nav>
          <Stack />
        </>
      </Router>
    </div>
  )
}

A.displayName = "A"
