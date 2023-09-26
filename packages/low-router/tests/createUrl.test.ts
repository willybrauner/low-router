import { describe, expect, it, vi } from "vitest"
import { LowRouter } from "../src"

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
        {
          path: "/c/:id",
          name: "c",
        },
        {
          path: "/f/:id?",
          name: "f",
        },
      ]

      const router = new LowRouter(routes, { debug: false })
      expect(router.createUrl({ name: "a" })).toBe("/")
      expect(router.createUrl({ name: "b" })).toBe("/b")
      expect(router.createUrl({ name: "c", params: { id: "123" } })).toBe("/c/123")
      expect(router.createUrl({ name: "b", params: { id: "123" } })).toBe("/b")
      expect(router.createUrl({ name: "z", params: { xid: "foo" } })).toBe("/b/x/foo/z")

      // not found
      expect(router.createUrl({ name: "no-exist-name" })).toBe(undefined)

      // optional param
      expect(router.createUrl({ name: "f", params: { id: "123" } })).toBe("/f/123")
      expect(router.createUrl({ name: "f" })).toBe("/f")

      resolve()
    })
  })
})
