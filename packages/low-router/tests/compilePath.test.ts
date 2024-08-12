import { describe, expect, it } from "vitest"
import { compilePath } from "../src/utils/compilePath"

describe.concurrent("compile path", () => {
  it("should compile path with params", () => {
    expect(compilePath("/foo/:id?/zoo")({ id: "bar" })).toBe("/foo/bar/zoo")
    expect(compilePath("/foo/:id?/zoo")({})).toBe("/foo/zoo")
    expect(compilePath("/foo/:id?/zoo")({})).toBe("/foo/zoo")

    expect(compilePath("/foo/zoo?a=b")({})).toBe("/foo/zoo?a=b")
    expect(compilePath("/:id/zoo?a=b")({ id: "bar" })).toBe("/bar/zoo?a=b")
    expect(compilePath("/:id?/zoo?a=b")({ id: "bar" })).toBe("/bar/zoo?a=b")
    expect(compilePath("/zoo/:bar?")({ bar: "zoo" })).toBe("/zoo/zoo")
    expect(compilePath("/zoo/:bar?params=one")({ bar: "zoo" })).toBe("/zoo/zoo?params=one")

    expect(compilePath("/test/:id#foobar")({ id: "foo" })).toBe("/test/foo#foobar")
    expect(compilePath("/test/:params?lang=en")({ params: "helloParams" })).toBe(
      "/test/helloParams?lang=en"
    )
  })
})
