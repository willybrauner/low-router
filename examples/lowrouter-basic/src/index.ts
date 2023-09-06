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
    action: async (context) => {
      //      await new Promise((resolve) => setTimeout(resolve, 500))
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

const router = new Router(routes, { baseUrl: "/" })

/**
 * links
 */
const links = document.querySelectorAll(".link")
console.log(links)

for (let link of links) {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const href = link.getAttribute("href")
    router.resolve(href!).then(() => console.log(href, "done"))
  })
}
