import "./style.css"
import { Router } from "@wbe/lowrouter"

const stack = document.querySelector(".stack")

const routes = [
  {
    path: "/",
    name: "home",
    action: (context) => {
      stack.innerHTML = context.route.name
      console.log(stack.innerHTML, context)
    },
  },
  {
    path: "/about",
    name: "about",
    props: { foo: "bar" }, // add props to route
    action: async (context) => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      stack.innerHTML = context.route.name
      console.log(stack.innerHTML, context)
    },
  },
  {
    path: "/about/:id",
    name: "about with id",
    action: async (context) => {
      stack.innerHTML = `${context.route.name}: ${context.params.id}`
      console.log(stack.innerHTML, context, context.params)
    },
  },
]

/**
 * Create router
 */
const router = new Router(routes, { baseUrl: "/" })

/**
 * Listen links
 */
const links = document.querySelectorAll(".link")
for (let link of links) {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const href = link.getAttribute("href")
    router.resolve(href!).then(() => console.log(href, "done"))
  })
}
