import { describe, expect, it } from "vitest"
import { normalizePath } from "../src"

describe.concurrent("normalize path", () => {
  it("should normalize path format", () => {
    expect(normalizePath("/foo///bar")).toBe("/foo/bar")
    expect(normalizePath("/foo///bar/")).toBe("/foo/bar")
    expect(normalizePath("/foo/bar/foo")).toBe("/foo/bar/foo")
    expect(normalizePath("/foo/bar/foo/")).toBe("/foo/bar/foo")

    expect(normalizePath("///")).toBe("/")
    expect(normalizePath("/")).toBe("/")
    expect(normalizePath("")).toBe("/")
    expect(normalizePath(null)).toBe("/")

    expect(normalizePath("/---test/")).toBe("/---test")
    expect(normalizePath("---test/")).toBe("---test")

    for (let protocol of ["http", "https"]) {
      expect(normalizePath(`${protocol}://foo/bar/`)).toBe(`${protocol}://foo/bar`)
      expect(normalizePath(`${protocol}://foo////bar/`)).toBe(`${protocol}://foo/bar`)
    }
  })
})
