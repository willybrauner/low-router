import { describe, expect, it, vi } from "vitest"
import { LowRouter } from "../src"

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
      const router = new LowRouter(routes)
      const { response, context } = await router.resolve("/foo")
      expect(response).toEqual("hello")
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
      const router = new LowRouter(routes)
      const { response } = await router.resolve("/foo")
      expect(response).toBe("hello /foo")
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
      const router = new LowRouter(routes)
      router.resolve("/bar").then(({ response, context }) => {
        expect(mock).not.toHaveBeenCalled()
        expect(response).toBe(undefined)
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

      const router = new LowRouter(routes, {
        onResolve: ({ response, context }) => {
          expect(context.pathname).toEqual("/foo")
          expect(context.base).toEqual("/")
          expect(context.params).toEqual({})
          expect(context.route.path).toEqual("/foo")
          expect(response).toBe("action response!")
        },
      })
      const { response } = await router.resolve("/foo")
      expect(response).toBe("action response!")
      resolve()
    })
  })

  it("should resolve child route", () => {
    return new Promise(async (resolve: any) => {
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
      const { response, context } = await router.resolve("/b")
      expect(response).toBe("bbb resolve")
      resolve()
    })
  })
})
