import { describe, expect, it, vi } from "vitest"
import { LowRouter } from "../src"

describe.concurrent("createUrl", () => {
  it("should create url", () => {
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

    const router = new LowRouter(routes)
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
  })

  it("should create url with params in base", () => {
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

    const router = new LowRouter(routes, { base: "/:lang/test" })
    expect(router.createUrl({ name: "a", params: { lang: "fr" } })).toBe("/fr/test")
    expect(router.createUrl({ name: "b", params: { lang: "en" } })).toBe("/en/test/b")
    expect(router.createUrl({ name: "c", params: { lang: "en", id: "123" } })).toBe(
      "/en/test/c/123"
    )

    // // not found
    expect(router.createUrl({ name: "no-exist-name", params: { lang: "en" } })).toBe(undefined)

    // // optional param
    expect(router.createUrl({ name: "f", params: { id: "123", lang: "en" } })).toBe(
      "/en/test/f/123"
    )
    expect(router.createUrl({ name: "f", params: { lang: "en" } })).toBe("/en/test/f")
  })
})
