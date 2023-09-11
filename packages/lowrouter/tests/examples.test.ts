import { describe, expect, it, vi } from "vitest"
import { Router } from "../src"
describe.concurrent("router", () => {
  it("resolve() method should return a route context object", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: (context) => {
            mock(context)
          },
        },
      ]
      const router = new Router(routes)
      const context = await router.resolve("/foo")

      expect(context.baseUrl).toEqual("/")
      expect(context.pathname).toEqual("/foo")
      expect(context.params).toEqual({})
      expect(context.route.path).toEqual("/foo")
      expect(mock).toHaveBeenCalledTimes(1)

      await router.resolve("/foo")
      expect(mock).toHaveBeenCalledTimes(2)

      await router.resolve("/foo")
      expect(mock).toHaveBeenCalledTimes(3)
      resolve()
    })
  })
  it("resolve() method should return an error if the route doesn't match", () => {
    return new Promise(async (resolve: any) => {
      const mock = vi.fn()
      const routes = [
        {
          path: "/foo",
          action: (context) => {
            mock()
          },
        },
      ]
      const router = new Router(routes)
      const context = await router.resolve("/bar")
      expect(mock).not.toHaveBeenCalled()
      expect(context).toBe(undefined)
      resolve()
    })
  })
})
