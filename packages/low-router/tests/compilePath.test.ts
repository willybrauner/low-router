import { describe, expect, it } from "vitest"
import { compilePath } from "../src"

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
      "/test/helloParams?lang=en",
    )
  })

  it("should compile simple static path", () => {
    expect(compilePath("/")({})).toBe("/")
    expect(compilePath("/foo")({})).toBe("/foo")
    expect(compilePath("/foo/bar")({})).toBe("/foo/bar")
  })

  it("should compile path with single param", () => {
    expect(compilePath("/:id")({ id: "123" })).toBe("/123")
    expect(compilePath("/users/:id")({ id: "42" })).toBe("/users/42")
  })

  it("should compile path with multiple params", () => {
    expect(compilePath("/:lang/:page")({ lang: "en", page: "home" })).toBe("/en/home")
    expect(compilePath("/users/:userId/posts/:postId")({ userId: "1", postId: "99" })).toBe(
      "/users/1/posts/99",
    )
  })

  it("should handle optional params when missing", () => {
    expect(compilePath("/:id?")({})).toBe("/")
    expect(compilePath("/users/:id?")({})).toBe("/users")
  })

  it("should handle optional params when provided", () => {
    expect(compilePath("/:id?")({ id: "abc" })).toBe("/abc")
    expect(compilePath("/users/:id?")({ id: "abc" })).toBe("/users/abc")
  })

  it("should compile path with hash", () => {
    expect(compilePath("/foo#section")({})).toBe("/foo#section")
    expect(compilePath("/foo/:id#section")({ id: "bar" })).toBe("/foo/bar#section")
  })

  it("should compile path with query string", () => {
    expect(compilePath("/foo?key=value")({})).toBe("/foo?key=value")
    expect(compilePath("/foo?a=1&b=2")({})).toBe("/foo?a=1&b=2")
  })

  it("should compile path with query string and hash", () => {
    expect(compilePath("/foo?key=value#section")({})).toBe("/foo?key=value#section")
    expect(compilePath("/foo/:id?key=value#section")({ id: "bar" })).toBe(
      "/foo/bar?key=value#section",
    )
  })

  it("should remove trailing slashes", () => {
    expect(compilePath("/foo/:id?/")({ id: undefined })).toBe("/foo")
  })

  it("should collapse multiple slashes", () => {
    expect(compilePath("/foo/:a?/:b?")({ a: undefined, b: undefined })).toBe("/foo")
    expect(compilePath("/foo/:a?/:b?")({ a: "x" })).toBe("/foo/x")
  })

  it("should support catch-all params (:name*)", () => {
    expect(compilePath("/:path*")({ path: "foo/bar/baz" })).toBe("/foo/bar/baz")
    expect(compilePath("/:path*")({})).toBe("/")
    expect(compilePath("/:404*")({ "404": "anything" })).toBe("/anything")
  })
})
