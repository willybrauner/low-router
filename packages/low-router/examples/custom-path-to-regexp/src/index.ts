import "./style.css"
import { LowRouter } from "@wbe/low-router"
import type { Matcher } from "@wbe/low-router"

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
    action: async (context) => (stack.innerHTML = `${context.route?.name}: ${context?.params?.id}`),
  },
  // 404 route
  {
    path: "{*path}",
    name: "not found",
    action: (context) => {
      console.log("404 not found", context)
      stack.innerHTML = context?.route?.name
    },
  },
]

// Use path-to-regexp's match & compile directly
// https://github.com/pillarjs/path-to-regexp
import { match, compile } from "path-to-regexp"

// Custom matcher using path-to-regexp's match function
// It returns params in the correct format (arrays for wildcards)
const customMatcher: Matcher = (pattern, pathname) => {
  let query = {}
  let hash = null

  const hashIndex = pathname.indexOf("#")
  if (hashIndex !== -1) hash = pathname.slice(hashIndex + 1)

  const queryIndex = pathname.indexOf("?")
  if (queryIndex !== -1) {
    const qs = pathname.slice(queryIndex + 1, hashIndex !== -1 ? hashIndex : undefined)
    new URLSearchParams(qs).forEach((v, k) => (query[k] = v))
  }

  const cleanPath = pathname.split("?")[0].split("#")[0]
  
  // use match function from path-to-regexp to get params
  const result = match(pattern)(cleanPath)
  if (result) return [true, result.params as any, query, hash]
  return [false, {}, query, hash]
}

/**
 * Create router
 * Both matcher and compilePath can be swapped with path-to-regexp functions:
 * - matcher: uses pathToRegexp for route matching
 * - compilePath: uses compile for URL generation from params
 */
const router = new LowRouter(routes, {
  matcher: customMatcher,
  compilePath: compile,
})

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
