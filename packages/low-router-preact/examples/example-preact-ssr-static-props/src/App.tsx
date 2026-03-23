import { Link, Stack } from "@wbe/low-router-preact"

function App() {
  return (
    <div>
      <div>
        <Link to={{ name: "home" }}>{"home"}</Link>
        <Link to={{ name: "work", params: { id: "id-1" } }}>{"work id-1"}</Link>
        <Link to={{ name: "work", params: { id: "id-2" } }}>{"work id-2"}</Link>
      </div>
      <Stack clampRoutesRender={false} />
    </div>
  )
}

export default App
