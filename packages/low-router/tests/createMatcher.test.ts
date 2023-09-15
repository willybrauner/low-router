import { describe, expect, it } from "vitest"
import { createMatcher } from "../src"

describe("path to regex", () => {
  it("should parse the path", () => {
    const path = "/foo"

    const matcher = createMatcher()
    expect(matcher(path, "/foo")).toEqual([true, {}, {}])
    expect(matcher(path, "foo")).toEqual([false, null, null])
    expect(matcher(path, "/other")).toEqual([false, null, null])
  })

  it("should parse the path with param", () => {
    const path = "/test/:id"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo")).toEqual([true, { id: "foo" }, {}])
    expect(matcher(path, "/test/foo/")).toEqual([true, { id: "foo" }, {}])
    expect(matcher(path, "/test/bar")).toEqual([true, { id: "bar" }, {}])
    expect(matcher(path, "/test")).toEqual([false, null, null])
    expect(matcher(path, "/test/bar/foo")).toEqual([false, null, null])
  })

  it("should parse the path with optional param", () => {
    const path = "/test/:id?"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo")).toEqual([true, { id: "foo" }, {}])
    expect(matcher(path, "/test")).toEqual([true, { id: undefined }, {}])
  })

  it("should parse the path with wildcard", () => {
    const path = "/test/:id*"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo")).toEqual([true, { id: "foo" }, {}])
    expect(matcher(path, "/test/foo/bar/zo")).toEqual([true, { id: "foo/bar/zo" }, {}])
  })

  it("should parse the path with query params", () => {
    const path = "/test"
    const matcher = createMatcher()
    expect(matcher(path, "/test?lang=en&cat=super")).toEqual([
      true,
      {},
      { lang: "en", cat: "super" },
    ])
  })

  it("should parse the path with params & query params", () => {
    const path = "/test/:id?"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo?lang=en")).toEqual([true, { id: "foo" }, { lang: "en" }])
    expect(matcher(path, "/test/?lang=en")).toEqual([true, { id: undefined }, { lang: "en" }])
    expect(matcher(path, "/test?lang=en")).toEqual([true, { id: undefined }, { lang: "en" }])
  })
})
