import debug from "@wbe/debug"
const log = debug("low-router-preact:cache")

export interface CacheAPI {
  get: (key: string) => any
  set: (key: string, data: any) => void
}

/**
 * use a cache object
 */
export function useCache(cache: Record<any, any>, id: number | string): CacheAPI {
  const dataAlreadyExist = (key: string) => Object.keys(cache).some((el) => el === key)

  return {
    get: (key: string): any => {
      if (!dataAlreadyExist(key)) return null
      return cache[key]
    },
    set: (key: string, data: Record<string, any>): void => {
      if (dataAlreadyExist(key)) {
        log(id, `"${key}"`, "already exist in cache, skip", cache)
        return
      }
      cache[key] = data
      log(id, `"${key}"`, "has been cached", cache)
    },
  }
}
