import "./App.css"

import { routes } from "../../routes.tsx"
import { Stack } from "../../lowRouterReact/Stack.tsx"
import { useRouter } from "../../lowRouterReact/useRouter.tsx"

function App() {
  const { router, history } = useRouter()
  return (
    <div>
      {/* NAV */}
      <nav>
        {routes.map((route, index) => (
          <button
            key={index}
            children={route.name}
            onClick={() => {
              history.push(route.path)
            }}
          />
        ))}
      </nav>

      {/* RENDER */}
      <Stack />
    </div>
  )
}

export default App
