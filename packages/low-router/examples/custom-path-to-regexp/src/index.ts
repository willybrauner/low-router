import "./style.css"
import { LowRouter, createMatcher } from "@wbe/low-router"

const stack = document.querySelector(".stack")

const routes = [
  {
    path: "/",
    name: "home",
    action: (context) => (stack.innerHTML = context.route.name),
  },
  {
    path: "/about",
    name: "about",
    props: { foo: "bar" }, // add props to route
    action: async (context) => (stack.innerHTML = context.route.name),
  },
  {
    path: "/about/:id",
    name: "about with id",
    action: async (context) => (stack.innerHTML = `${context.route.name}: ${context.params.id}`),
  },
]

// we can use other path to regexp fn like the original "pathToRegexp" package
// https://github.com/pillarjs/path-to-regexp
import { compile, pathToRegexp } from "path-to-regexp"

// ex: customMatcher("/about/:id", "/about/1")
// return: [true, { id: "1" }, {}, null]
const customMatcher = createMatcher((path: string): { keys: any[]; regexp: RegExp } => {
  return pathToRegexp(path)
})

/**
 * Create router
 */
const router = new LowRouter(routes, { matcher: customMatcher, compile })

/**
 * Listen links
 */
const links = document.querySelectorAll(".link")
for (let link of links) {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    router.resolve(link.getAttribute("href")!)
  })
}
