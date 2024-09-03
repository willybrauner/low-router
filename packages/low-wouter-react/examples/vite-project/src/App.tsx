import "./App.css"
import { Link, Stack, StackTransitionsParams } from "@wbe/low-router-react"

function App() {
  const custom = async ({ prev, current, unmountPrev }: StackTransitionsParams) => {
    if (current?.root) current.root.style.opacity = "0"
    prev?.playOut?.().then(unmountPrev)
    await current?.playIn?.()
  }

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Stack clampRoutesRender={false} transitions={custom} />
    </div>
  )
}

export default App
