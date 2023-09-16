import { describe, expect, it, vi } from "vitest"
import { Router } from "../src"

describe.concurrent("resolve", () => {
  it("should return the action function return", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: (context) => {
            mock(context)
            return "hello"
          },
        },
      ]
      const router = new Router(routes)
      const res = await router.resolve("/foo")
      expect(res).toEqual("hello")
      expect(mock).toHaveBeenCalledTimes(1)

      await router.resolve("/foo")
      expect(mock).toHaveBeenCalledTimes(2)

      await router.resolve("/foo")
      expect(mock).toHaveBeenCalledTimes(3)
      resolve()
    })
  })
  it("should return the action async function return", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: async (context) => {
            await new Promise((resolve) => setTimeout(resolve, 200))
            mock(context)
            return "hello " + context.pathname
          },
        },
        {
          path: "/bar",
        },
      ]
      const router = new Router(routes)
      const res = await router.resolve("/foo")
      expect(res).toBe("hello /foo")
      expect(mock).toHaveBeenCalledTimes(1)
      resolve()
    })
  })

  it("should return an error if the route doesn't match", () => {
    return new Promise(async (resolve: any) => {
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
      const router = new Router(routes)
      router.resolve("/bar").then((res) => {
        expect(mock).not.toHaveBeenCalled()
        expect(res).toBe(undefined)
        resolve()
      })
    })
  })

  it("should exec onResolve handler option", () => {
    return new Promise(async (resolve: any) => {
      const routes = [
        {
          path: "/foo",
          action: () => "action response!",
        },
      ]

      const router = new Router(routes, {
        onResolve: (context, res) => {
          expect(context.pathname).toEqual("/foo")
          expect(context.base).toEqual("/")
          expect(context.params).toEqual({})
          expect(context.route.path).toEqual("/foo")
          expect(res).toBe("action response!")
        },
      })
      const res = await router.resolve("/foo")
      expect(res).toBe("action response!")
      resolve()
    })
  })

  it("should resolve child route", () => {
    return new Promise(async (resolve: any) => {
      const routes = [
        {
          path: "/",
          children: [
            {
              path: "",
              name: "a",
              action: () => "/ resolve",
            },
            {
              path: "/b",
              name: "bbb",
              action: (ctx) => `${ctx.route.name} resolve`,
            },
          ],
        },
        {
          path: "/c",
          children: [
            {
              path: "",
              name: "c",
              action: () => "/c resolve",
            },
            {
              path: "/d",
              name: "d",
              action: (ctx) => "/d resolve",
            },
          ],
        },
      ]

      const router = new Router(routes)
      const ctx = await router.resolve("/b")
      expect(ctx).toBe("bbb resolve")
      resolve()
    })
  })
})

it("should accept an object as a route", () => {
  // TODO
})
