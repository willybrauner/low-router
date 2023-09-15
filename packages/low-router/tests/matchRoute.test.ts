import { describe, expect, it } from "vitest"
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
          children: [
            {
              path: "",
              action: () => "/ resolve",
            },
            {
              path: "/f",
              action: () => "/f resolve",
            },
          ],
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
              name: "b",
              action: () => "/b resolve",
            },
            {
              path: "/:id",
              children: [
                {
                  path: "",
                  action: () => "/:id resolve",
                },
                {
                  path: "/d",
                  action: () => "/d resolve",
                },
              ],
            },
          ],
        },
        {
          path: "/c",
        },
      ]
      const router = new Router(routes)
      let match: RouteContext | undefined

      match = router.matchRoute("/")
      expect(match.pathname).toBe("/")
      expect(match.route.path).toBe("")
      expect(await match.route.action()).toBe("/ resolve")

      match = router.matchRoute("/f")
      expect(match.pathname).toBe("/f")
      expect(await match.route.action()).toBe("/f resolve")

      match = router.matchRoute("/c")
      expect(match.pathname).toBe("/c")

      match = router.matchRoute("/a")
      expect(match.pathname).toBe("/a")
      expect(match.route.path).toBe("")
      expect(await match.route.action()).toBe("/a resolve")

      match = router.matchRoute("/a/b")
      expect(match.pathname).toBe("/a/b")
      expect(await match.route.action()).toBe("/b resolve")

      match = router.matchRoute("/a/foo-id")
      expect(match.pathname).toBe("/a/foo-id")
      expect(await match.route.action()).toBe("/:id resolve")

      match = router.matchRoute("/a/foo-id/d")
      expect(match.pathname).toBe("/a/foo-id/d")
      expect(await match.route.action()).toBe("/d resolve")

      resolve()
    })
  })
})
