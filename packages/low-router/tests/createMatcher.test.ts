import { describe, expect, it } from "vitest"
import { createMatcher } from "../src"

describe("path to regex", () => {
  it("should parse the path", () => {
    const path = "/foo"

    const matcher = createMatcher()
    expect(matcher(path, "/foo")).toEqual([true, {}, {}, null])
    expect(matcher(path, "foo")).toEqual([false, null, null, null])
    expect(matcher(path, "/other")).toEqual([false, null, null, null])
  })

  it("should parse the path with param", () => {
    const path = "/test/:id"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo")).toEqual([true, { id: "foo" }, {}, null])
    expect(matcher(path, "/test/foo/")).toEqual([true, { id: "foo" }, {}, null])
    expect(matcher(path, "/test/bar")).toEqual([true, { id: "bar" }, {}, null])
    expect(matcher(path, "/test")).toEqual([false, null, null, null])
    expect(matcher(path, "/test/bar/foo")).toEqual([false, null, null, null])
  })

  it("should parse the path with optional param", () => {
    const path = "/test/:id?"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo")).toEqual([true, { id: "foo" }, {}, null])
    expect(matcher(path, "/test")).toEqual([true, { id: undefined }, {}, null])
  })

  it("should parse the path with wildcard", () => {
    const path = "/test/:id*"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo")).toEqual([true, { id: "foo" }, {}, null])
    expect(matcher(path, "/test/foo/bar/zo")).toEqual([true, { id: "foo/bar/zo" }, {}, null])
  })

  it("should parse the path with query params", () => {
    const path = "/test"
    const matcher = createMatcher()
    expect(matcher(path, "/test?lang=en&cat=super")).toEqual([
      true,
      {},
      { lang: "en", cat: "super" },
      null,
    ])
  })

  it("should parse the path with params & query params", () => {
    const path = "/test/:id?"
    const matcher = createMatcher()
    expect(matcher(path, "/test/foo?lang=en")).toEqual([true, { id: "foo" }, { lang: "en" }, null])
    expect(matcher(path, "/test/?lang=en")).toEqual([true, { id: undefined }, { lang: "en" }, null])
    expect(matcher(path, "/test?lang=en")).toEqual([true, { id: undefined }, { lang: "en" }, null])
  })

  it("should parse the path with hashes", () => {
    const path = "/test"
    const matcher = createMatcher()
    expect(matcher(path, "/test#foo")).toEqual([true, {}, {}, "foo"])
    expect(matcher(path, "/test#foobar")).toEqual([true, {}, {}, "foobar"])
    expect(matcher(path, "/tt#foobar")).toEqual([false, null, null, null])
  })

  it("should parse the path with params, query and hash", () => {
    const path = "/test/:id"
    const matcher = createMatcher()
    expect(matcher(path, "/test/id?lang=en&cat=bla#foo")).toEqual([
      true,
      {
        id: "id",
      },
      {
        lang: "en",
        cat: "bla",
      },
      "foo",
    ])
  })
})
