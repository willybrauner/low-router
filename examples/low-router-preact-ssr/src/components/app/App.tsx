import css from "./App.module.scss"
import { Link, Stack, StackTransitionsParams, useRouter } from "@wbe/low-router-preact"

function App() {
  const router = useRouter()

  const custom = async ({ prev, current, unmountPrev }: StackTransitionsParams) => {
    if (current?.root) current.root.style.opacity = "0"
    prev?.playOut?.().then(unmountPrev)
    await current?.playIn?.()
  }

  return (
    <div className={css.root}>
      <div>
        <button onClick={() => router.i18n.setLocale("fr")}>fr</button>
        <button onClick={() => router.i18n.setLocale("en")}>en</button>
      </div>
      <br />

      <div>
        <Link to={{ name: "home" }}>{"home"}</Link>
        <Link to={{ name: "about" }}>{"about"}</Link>
        <Link to={{ name: "work", params: { id: "test-1" } }}>{"work test-1"}</Link>
        <Link to={{ name: "dd" }}>{"about/bar/bb/dd"}</Link>
      </div>

      <Stack transitions={custom} clampRoutesRender={false} />
    </div>
  )
}

export default App
