import { describe, expect, it, vi } from "vitest"
import { LowRouter } from "../src"

describe.concurrent("compile path", () => {
  it("should compile path with params", () => {
    expect(LowRouter.compilePath("/foo/:id?/zoo")({ id: "bar" })).toBe("/foo/bar/zoo");
    expect(LowRouter.compilePath("/foo/:id?/zoo")({ })).toBe("/foo/zoo");
    expect(LowRouter.compilePath("/foo/:id?/zoo")({ })).toBe("/foo/zoo");

    expect(LowRouter.compilePath("/foo/zoo?a=b")({ })).toBe("/foo/zoo?a=b");
    expect(LowRouter.compilePath("/:id/zoo?a=b")({ id: "bar" })).toBe("/bar/zoo?a=b");
    expect(LowRouter.compilePath("/:id?/zoo?a=b")({ id: "bar" })).toBe("/bar/zoo?a=b");
    expect(LowRouter.compilePath("/zoo/:bar?")({ bar: "zoo" })).toBe("/zoo/zoo");
    expect(LowRouter.compilePath("/zoo/:bar?params=one")({ bar: "zoo" })).toBe("/zoo/zoo?params=one");

    expect(LowRouter.compilePath("/test/:id#foobar")({id: "foo"})).toBe("/test/foo#foobar")
    expect(LowRouter.compilePath("/test/:params?lang=en")({params: "helloParams"})).toBe("/test/helloParams?lang=en")

  })
})
