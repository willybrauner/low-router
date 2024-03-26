import { describe, expect, it, vi } from "vitest"
import { LowRouter } from "../src"

describe.concurrent("resolveSync", () => {
  it("should return the action function return", () => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: (context) => {
            mock(context)
            return "hello sync response"
          },
        },
      ]
      const router = new LowRouter(routes)
      const { response, context } = router.resolveSync("/foo")
      expect(response).toEqual("hello sync response")
      expect(mock).toHaveBeenCalledTimes(1)

      router.resolveSync("/foo")
      expect(mock).toHaveBeenCalledTimes(2)

      router.resolveSync("/foo")
      expect(mock).toHaveBeenCalledTimes(3)
  })

  it("should return the action sync function return", () => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: (context) => {
            mock(context)
            return "hello " + context.pathname
          },
        },
        {
          path: "/bar",
        },
      ]
      const router = new LowRouter(routes)
      const { response } = router.resolveSync("/foo")
      expect(response).toBe("hello /foo")
      expect(mock).toHaveBeenCalledTimes(1)
    })


  it("should return an error if the route doesn't match", () => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: () => {
            mock()
            return "hello"
          },
        },
        { path: "bar" },
      ]
      const router = new LowRouter(routes)
      const { response } = router.resolveSync("/bar")
      expect(mock).not.toHaveBeenCalled()
      expect(response).toBe(undefined)
  })

  it("should exec onResolve handler option", () => {
      const routes = [
        {
          path: "/foo",
          action: () => "action response!",
        },
      ]

      const router = new LowRouter(routes, {
        onResolve: ({ response, context }) => {
          expect(context.pathname).toEqual("/foo")
          expect(context.base).toEqual("/")
          expect(context.params).toEqual({})
          expect(context.route.path).toEqual("/foo")
          expect(response).toBe("action response!")
        },
      })
      const { response } = router.resolveSync("/foo")
      expect(response).toBe("action response!")
  })

  it("should resolve child route", () => {
      const routes = [
        {
          path: "/",
          name: "a",
          action: () => "/ resolve",
          children: [
            {
              path: "/b",
              name: "bbb",
              action: (ctx) => `${ctx.route.name} resolve`,
            },
          ],
        },
        {
          path: "/c",
          name: "c",
          action: () => "/c resolve",
          children: [
            {
              path: "/d",
              name: "d",
              action: (ctx) => "/d resolve",
            },
          ],
        },
      ]

      const router = new LowRouter(routes)
      const { response } = router.resolveSync("/b")
      expect(response).toBe("bbb resolve")
  })
})


