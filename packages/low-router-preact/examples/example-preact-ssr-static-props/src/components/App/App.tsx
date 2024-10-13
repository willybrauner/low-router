import css from "./App.module.scss"
import { Link, Stack, useRouter } from "@wbe/low-router-preact"

function App() {
  const router = useRouter()

  return (
    <div className={css.root}>
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
