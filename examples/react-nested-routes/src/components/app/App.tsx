import "./App.css"

import { routes } from "../../routes.tsx"
import { Stack } from "../../lowRouterReact/Stack.tsx"
import { useRouter } from "../../lowRouterReact/useRouter.tsx"

function App() {
  const { router } = useRouter()
  return (
    <div>
      {/* NAV */}
      <nav>
        {routes.map((route, index) => (
          <button
            key={index}
            children={route.name}
            onClick={() => {
              router.resolve(route.path)
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
