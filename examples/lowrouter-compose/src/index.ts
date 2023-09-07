import "./style.css"
import { Router } from "@wbe/lowrouter"

const stack = document.querySelector(".stack")

const routes = [
  {
    path: "/",
    name: "home",
    action: (context) => {
      stack.innerHTML = context.route.name
    },
  },
  {
    path: "/about",
    name: "about",
    props: { foo: "bar" }, // add props to route
    action: async (context) => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      stack.innerHTML = context.route.name
    },
  },
  {
    path: "/about/:id",
    name: "about with id",
    action: async (context) => {
      stack.innerHTML = `${context.route.name}: ${context.params.id}`
    },
  },
]

/**
 * Create router
 */
const router = new Router(routes, {
  baseUrl: "/",
  debug: false,
  onUpdate: (context) => {
    // console.log("update !", context)
  },
})

/**
 * Listen links
 */
const links = document.querySelectorAll(".link")
for (let link of links) {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const href = link.getAttribute("href")
    router.resolve(href!)
  })
}
