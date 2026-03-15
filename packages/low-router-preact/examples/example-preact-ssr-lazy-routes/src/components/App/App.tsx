import css from "./App.module.scss"
import { Link, Stack, StackTransitionsParams } from "@wbe/low-router-preact"

function App() {
  const custom = async ({ prev, current, unmountPrev }: StackTransitionsParams) => {
    if (current?.root) current.root.style.opacity = "0"
    prev?.playOut?.().then(unmountPrev)
    await current?.playIn?.()
  }

  return (
    <div className={css.root}>
      <nav>
        <Link to={{ name: "home" }}>home (non-lazy)</Link>
        <Link to={{ name: "about" }}>about (lazy)</Link>
        <Link to={{ name: "work", params: { id: "42" } }}>work/42 (non-lazy)</Link>
        <Link to={{ name: "not-found" }}>404 (lazy)</Link>
      </nav>
      <Stack transitions={custom} />
    </div>
  )
}

export default App
