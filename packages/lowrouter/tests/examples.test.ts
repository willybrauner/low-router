import { describe, expect, it } from "vitest"
describe.concurrent("example", () => {
  it("example should work", () => {
    expect(true).toBe(true)
  })
})
