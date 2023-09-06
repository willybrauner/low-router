import { defineConfig } from "vite"

export default defineConfig({
  //  base: "/custom-base/",

  plugins: [
    {
      name: "rewrite-middleware",
      configureServer(serve) {
        serve.middlewares.use((req, res, next) => {
          for (let p of ["about", "contact"]) {
            if (req.url.startsWith(`/${p}`)) req.url = `/${p}.html`
          }
          next()
        })
      },
    },
  ],
})
