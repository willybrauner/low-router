import "./style.css"
import { LowRouter, Route } from "@wbe/low-router"

const stack = document.querySelector(".stack")

const routes: Route[] = [
  {
    path: "/",
    name: "home",
    action: (context) => {
      stack!.innerHTML = context.route.name
      console.log(stack!.innerHTML, context)
    },
  },
  {
    path: "/about",
    name: "about",
    props: { foo: "bar" }, // add props to route
    action: (context) => {
      stack!.innerHTML = context.route.name
      console.log(stack!.innerHTML, context)
    },
  },
  {
    path: "/about/:id",
    name: "about with id",
    action: (context) => {
      stack!.innerHTML = `${context.route.name}: ${context.params.id}`
      console.log(stack!.innerHTML, context, context.params)
    },
  },
]

/**
 * Create router
 */
const router = new LowRouter(routes, { base: "/", debug: true })

/**
 * Listen links
 */
const links = document.querySelectorAll(".link")
for (let link of links) {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const href = link.getAttribute("href")
    const { response, context } = router.resolveSync(href!)
    console.log({ response, context })
  })
}
