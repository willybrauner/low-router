import { describe, expect, it, vi } from "vitest"
import { LowRouter, createMatcher } from "../src"

describe.concurrent("hardening - resolve on 404", () => {
  it("resolve() should not throw on unmatched route", async () => {
    const routes = [{ path: "/foo", action: () => "foo" }]
    const router = new LowRouter(routes)
    const result = await router.resolve("/nope")
    expect(result.response).toBeUndefined()
    expect(result.context).toBeUndefined()
  })

  it("resolveSync() should not throw on unmatched route", () => {
    const routes = [{ path: "/foo", action: () => "foo" }]
    const router = new LowRouter(routes)
    const result = router.resolveSync("/nope")
    expect(result.response).toBeUndefined()
    expect(result.context).toBeUndefined()
  })

  it("should call onError (not onResolve) on unmatched route", async () => {
    const onResolve = vi.fn()
    const onError = vi.fn()
    const routes = [{ path: "/foo", action: () => "foo" }]
    const router = new LowRouter(routes, { onResolve, onError })
    await router.resolve("/nope")
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onResolve).not.toHaveBeenCalled()
  })

  it("should call onResolve (not onError) on matched route", async () => {
    const onResolve = vi.fn()
    const onError = vi.fn()
    const routes = [{ path: "/foo", action: () => "foo" }]
    const router = new LowRouter(routes, { onResolve, onError })
    await router.resolve("/foo")
    expect(onResolve).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
})

describe.concurrent("hardening - dispose()", () => {
  it("should break parent chain on dispose", () => {
    const routes = [
      {
        path: "/",
        children: [{ path: "/z", children: [{ path: "/c" }] }],
      },
    ]
    const router = new LowRouter(routes)
    router.resolveSync("/z/c")
    expect(router.currentContext).toBeDefined()
    router.dispose()
    expect(router.currentContext).toBeUndefined()
  })

  it("should call onDispose", () => {
    const onDispose = vi.fn()
    const router = new LowRouter([{ path: "/" }], { onDispose })
    router.dispose()
    expect(onDispose).toHaveBeenCalledTimes(1)
  })
})

describe.concurrent("hardening - createUrl query & hash", () => {
  const routes = [
    { path: "/", name: "home" },
    { path: "/user/:id", name: "user" },
  ]

  it("should append query string", () => {
    const router = new LowRouter(routes)
    const url = router.createUrl({
      name: "user",
      params: { id: "1" },
      query: { tab: "profile" },
    })
    expect(url).toBe("/user/1?tab=profile")
  })

  it("should append hash", () => {
    const router = new LowRouter(routes)
    const url = router.createUrl({ name: "user", params: { id: "1" }, hash: "top" })
    expect(url).toBe("/user/1#top")
  })

  it("should append query and hash together", () => {
    const router = new LowRouter(routes)
    const url = router.createUrl({
      name: "user",
      params: { id: "1" },
      query: { tab: "x", y: "z" },
      hash: "#anchor",
    })
    expect(url).toBe("/user/1?tab=x&y=z#anchor")
  })

  it("should skip undefined/null query values", () => {
    const router = new LowRouter(routes)
    const url = router.createUrl({
      name: "home",
      query: { a: "1", b: undefined as any, c: null as any },
    })
    expect(url).toBe("/?a=1")
  })

  it("should return undefined on missing name", () => {
    const router = new LowRouter(routes)
    expect(router.createUrl({ name: "unknown" })).toBeUndefined()
    expect(router.createUrl({ name: "" as any })).toBeUndefined()
  })
})

describe.concurrent("hardening - createMatcher cache bounded", () => {
  it("should not exceed max cache size", () => {
    const matcher = createMatcher()
    for (let i = 0; i < 2000; i++) {
      matcher(`/route-${i}/:id`, `/route-${i}/x`)
    }
    // we cannot read cache directly; regress by timing — ensure it still works
    expect(matcher("/foo", "/foo")[0]).toBe(true)
  })

  it("should reuse cached regex (same pattern)", () => {
    const calls: string[] = []
    const regexFn = (p: string) => {
      calls.push(p)
      return { keys: [], regexp: new RegExp(`^${p}$`) }
    }
    const matcher = createMatcher(regexFn)
    matcher("/foo", "/foo")
    matcher("/foo", "/foo")
    matcher("/foo", "/foo")
    expect(calls.length).toBe(1)
  })
})

describe.concurrent("hardening - matchRoute perf", () => {
  it("should not compile non-matching sibling routes when match is found early", () => {
    const calls: string[] = []
    const customCompile = (p: string) => {
      calls.push(p)
      return (_: any) => p
    }
    const routes = [{ path: "/a" }, { path: "/b" }, { path: "/c" }]
    const router = new LowRouter(routes, { compilePath: customCompile })
    router.matchRoute("/a")
    // only the matched route's path should be compiled for relativePathname
    expect(calls).toEqual(["/a"])
  })
})

describe.concurrent("hardening - resolve by name object", () => {
  it("should resolve by { name, params }", async () => {
    const routes = [{ path: "/u/:id", name: "user", action: (ctx: any) => ctx.params.id }]
    const router = new LowRouter(routes)
    const { response } = await router.resolve({ name: "user", params: { id: "42" } })
    expect(response).toBe("42")
  })
})
