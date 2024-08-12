import { Hash, QueryParams, RouteParams } from "../types"

export type RegexFn = (pattern: string) => { keys: Record<"name", string>[]; regexp: RegExp }
export type CreateMatcher = (regexFn?: RegexFn) => Matcher
export type Matcher = (pattern: string, path: string) => [boolean, RouteParams, QueryParams, Hash]

/**
 * Base stolen from https://github.com/molefrog/wouter/blob/main/matcher.js
 * @name CreateMatcher
 * @description Create a matcher function.
 * regexFn param allows to customise the regex match as needed:
 * @param regexFn
 *
 * This function passed as argument, takes a string pattern as param
 * and return { keys: Record<"name", string>[]; regexp: RegExp }
 */

export const createMatcher: CreateMatcher = (regexFn: RegexFn = pathToRegexp): Matcher => {
  let cache = {}

  // obtains a cached regexp version of the pattern
  const getRegexp = (pattern) => cache[pattern] || (cache[pattern] = regexFn(pattern))

  // pattern is path with dynamic params
  // pathname is static URL pathname we want to compare with pattern
  return (pattern, pathname) => {
    let queryParams = {}
    let hash = null
    const queryIndex = pathname.indexOf("?")
    const hashIndex = pathname.indexOf("#")

    // Extract hash
    if (hashIndex !== -1) {
      hash = pathname.slice(hashIndex + 1)
    }

    // Extract query parameters
    if (queryIndex !== -1) {
      const queryString = pathname.slice(queryIndex + 1, hashIndex !== -1 ? hashIndex : undefined)
      const searchParams = new URLSearchParams(queryString)
      searchParams.forEach((value, key) => (queryParams[key] = value))
    }

    // finally remove query and hash from pathname
    for (let e of ["?", "#"]) {
      pathname = pathname.includes(e) ? pathname.split(e)[0] : pathname
    }

    // exec custom regexFn
    const { regexp, keys } = getRegexp(pattern || "")
    const test = regexp.exec(pathname)
    if (!test) return [false, null, null, null]

    const params = keys.reduce((params, key, i) => {
      params[key.name] = test[i + 1]
      return params
    }, {})
    return [true, params, queryParams, hash]
  }
}

export const pathToRegexp = (pattern: string): { keys: Record<"name", string>[]; regexp: RegExp } => {
  // escapes a regexp string (borrowed from path-to-regexp sources)
  // https://github.com/pillarjs/path-to-regexp/blob/v3.0.0/index.js#L202
  const _escapeRx = (str) => str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1")

  // returns a segment representation in RegExp based on flags
  // adapted and simplified version from path-to-regexp sources
  const _rxForSegment = (repeat, optional, prefix) => {
    let capture = repeat ? "((?:[^\\/]+?)(?:\\/(?:[^\\/]+?))*)" : "([^\\/]+?)"
    if (optional && prefix) capture = "(?:\\/" + capture + ")"
    return capture + (optional ? "?" : "")
  }

  const groupRx = /:([A-Za-z0-9_]+)([?+*]?)/g

  let match = null,
    lastIndex = 0,
    keys = [],
    result = ""

  while ((match = groupRx.exec(pattern)) !== null) {
    const [_, segment, mod] = match
    // :foo  [1]      (  )
    // :foo? [0 - 1]  ( o)
    // :foo+ [1 - ∞]  (r )
    // :foo* [0 - ∞]  (ro)
    const repeat = mod === "+" || mod === "*"
    const optional = mod === "?" || mod === "*"
    const prefix = optional && pattern[match.index - 1] === "/" ? 1 : 0
    const prev = pattern.substring(lastIndex, match.index - prefix)
    keys.push({ name: segment })
    lastIndex = groupRx.lastIndex
    result += _escapeRx(prev) + _rxForSegment(repeat, optional, prefix)
  }

  result += _escapeRx(pattern.substring(lastIndex))
  return { keys, regexp: new RegExp("^" + result + "(?:\\/)?$", "i") }
}
