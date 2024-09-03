import "./App.css"
import { Link, Stack } from "@wbe/low-router-react"

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Stack clampRoutesRender={false} />
    </div>
  )
}

export default App
