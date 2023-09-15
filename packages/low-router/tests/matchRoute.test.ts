import { describe, expect, it, vi } from "vitest"
import { RouteContext, Router } from "../src"

describe.concurrent("matchRoute", () => {
  it("should match with route without param", () => {
    return new Promise(async (resolve: any) => {
      const routes = [{ path: "/a" }, { path: "/b" }]
      const router = new Router(routes)
      let match

      match = router.matchRoute("/a")
      expect(match.pathname).toBe("/a")
      expect(match.base).toBe("/")
      expect(match.route.path).toBe("/a")

      match = router.matchRoute("/b")
      expect(match.pathname).toBe("/b")
      expect(match.base).toBe("/")
      expect(match.route.path).toBe("/b")

      match = router.matchRoute("/c")
      expect(match).toBeUndefined()

      resolve()
    })
  })

  it("should match with param", () => {
    return new Promise(async (resolve: any) => {
      const routes = [{ path: "/a" }, { path: "/b/:id" }]
      const router = new Router(routes)

      const match = router.matchRoute("/b/c")
      expect(match.pathname).toBe("/b/c")
      expect(match.base).toBe("/")
      expect(match.route.path).toBe("/b/:id")

      // error, this route doesn't exist
      expect(router.matchRoute("/c")).toBe(undefined)
      expect(router.matchRoute("/c/c")).toBe(undefined)

      resolve()
    })
  })

  it("should match with optional param", () => {
    return new Promise(async (resolve: any) => {
      const routes = [{ path: "/b/:id?" }]
      const router = new Router(routes)

      const match = router.matchRoute("/b")
      expect(match.pathname).toBe("/b")
      expect(match.base).toBe("/")
      expect(match.route.path).toBe("/b/:id?")

      resolve()
    })
  })

  it("should match with param if base route is param", () => {
    return new Promise(async (resolve: any) => {
      const routes = [{ path: "/:id" }, { path: "/a" }]
      const router = new Router(routes)

      const match = router.matchRoute("/c")
      expect(match.pathname).toBe("/c")
      expect(match.base).toBe("/")
      expect(match.route.path).toBe("/:id")

      resolve()
    })
  })

  it("should match if is child route", () => {
    return new Promise(async (resolve: any) => {
      const routes = [
        {
          path: "/",
        },
        {
          path: "/a",
          children: [
            {
              path: "",
              action: () => "/a resolve",
            },
            {
              path: "/b",
              action: () => "/b resolve",
            },
            {
              path: "/:id",
              action: () => "/:id resolve",
            },
          ],
        },
        {
          path: "/c",
        },
      ]
      const router = new Router(routes)
      let match: RouteContext | undefined

      match = router.matchRoute("/c")
      expect(match.pathname).toBe("/c")

      match = router.matchRoute("/a")
      expect(match.pathname).toBe("/a")
      expect(match.route.path).toBe("")
      expect(await match.route.action()).toBe("/a resolve")

      match = router.matchRoute("/a/b")
      expect(match.pathname).toBe("/a/b")
      expect(await match.route.action()).toBe("/b resolve")
      // console.log("route", match)

      match = router.matchRoute("/a/foo")
      expect(match.pathname).toBe("/a/foo")
      expect(await match.route.action()).toBe("/:id resolve")
      // console.log("route", match)

      resolve()
    })
  })
})
