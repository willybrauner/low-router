import { Router } from "../lowRouterReact/Router.tsx"
import { Stack } from "../lowRouterReact/Stack.tsx"
import { useRouter } from "../lowRouterReact/useRouter.tsx"
import { routes } from "../routes.tsx"
import { createBrowserHistory } from "@wbe/low-router"

export const Foo = () => {
  const { history } = useRouter()
  const subRoutes = routes
    .find((route) => route.name === "about")
    .children.find((route) => route.name === "foo").children
  const base = "/about/foo"

  return (
    <div>
      <span>Foo</span>
      <Router
        routes={subRoutes}
        options={{ base, debug: true, id: 3 }}
        history={createBrowserHistory()}
      >
        <>
          <nav>
            {subRoutes?.map((route, index) => (
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

Foo.displayName = "Foo"