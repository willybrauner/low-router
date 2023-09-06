import "./style.css"
import { Router } from "@wbe/lowrouter"

const routes = [
  {
    path: "/",
    name: "home",
    action: (context) => {
      console.log("home", context)
    },
  },
  {
    path: "/about",
    name: "about",
    action: (context) => {
      console.log("about", context)
    },
  },
]

const router = new Router(routes)

/**
 *
 */
const links = document.querySelectorAll(".link")
console.log(links)

for (let link of links) {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const href = link.getAttribute("href")
    router.resolve(href!)
  })
}
