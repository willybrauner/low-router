import { describe, expect, it, vi } from "vitest"
import { Router } from "../src"

describe.concurrent("createUrl", () => {
  it("should create url", () => {
    return new Promise(async (resolve: any) => {
      const routes = [
        {
          path: "/",
          name: "a",
        },
        {
          path: "/b",
          children: [
            {
              path: "",
              name: "b",
              children: [
                {
                  path: "/x/:xid",
                  name: "x",
                  children: [
                    {
                      path: "/z",
                      name: "z",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: "/c/:id",
          name: "c",
        },
        {
          path: "/f/:id?",
          name: "f",
        },
      ]

      const router = new Router(routes, { debug: false })
      expect(router.createUrl("a")).toBe("/")
      expect(router.createUrl("b")).toBe("/b")
      expect(router.createUrl("c", { id: "123" })).toBe("/c/123")
      expect(router.createUrl("b", { id: "123" })).toBe("/b")
      expect(router.createUrl("z", { xid: "foo" })).toBe("/b/x/foo/z")

      // not found
      expect(router.createUrl("no-exist-name")).toBe(undefined)

      // optional param
      expect(router.createUrl("f", { id: "123" })).toBe("/f/123")
      expect(router.createUrl("f")).toBe("/f")

      resolve()
    })
  })
})
