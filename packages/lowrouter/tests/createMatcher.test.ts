import { describe, expect, it } from "vitest"
import { createMatcher } from "../src"

describe("path to regex", () => {
  it("should parse the path", () => {
    const url = "/foo"

    const matcher = createMatcher()

    expect(matcher(url, "/foo")).toEqual([true, {}])
    expect(matcher(url, "foo")).toEqual([false, null])
    expect(matcher(url, "/other")).toEqual([false, null])
  })

  it("should parse the path with param", () => {
    const url = "/test/:id"
    const matcher = createMatcher()
    expect(matcher(url, "/test/foo")).toEqual([true, { id: "foo" }])
    expect(matcher(url, "/test/foo/")).toEqual([true, { id: "foo" }])
    expect(matcher(url, "/test/bar")).toEqual([true, { id: "bar" }])
    expect(matcher(url, "/test")).toEqual([false, null])
    expect(matcher(url, "/test/bar/foo")).toEqual([false, null])
  })

  it("should parse the url with optional param", () => {
    const url = "/test/:id?"
    const matcher = createMatcher()
    expect(matcher(url, "/test/foo")).toEqual([true, { id: "foo" }])
    expect(matcher(url, "/test")).toEqual([true, { id: undefined }])
  })

  it("should parse the url with wildcard", () => {
    const url = "/test/:id*"
    const matcher = createMatcher()
    expect(matcher(url, "/test/foo")).toEqual([true, { id: "foo" }])
    expect(matcher(url, "/test/foo/bar/zo")).toEqual([true, { id: "foo/bar/zo" }])
  })

  it("should parse the url with query params", () => {
    // TODO
    // const url = "/test\\?lang=en"
    // const matcher = createMatcher()
    // expect(matcher(url, "/test")).toEqual([true, {}])
  })
})
