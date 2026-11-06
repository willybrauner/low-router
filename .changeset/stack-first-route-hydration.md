---
"@wbe/low-router-preact": patch
---

Stack: render the first route from the client first render (hydration)

On the client, the Stack started with no route and added the first one in an effect. The first render of the hydration was an empty Stack: preact dropped the page rendered by the server, then created it again from scratch (its DOM rebuilt, its images downloaded at once whatever their `loading="lazy"`).

With the first route resolved by the root Router on its first render, the Stack now renders it from its first render too: the hydration keeps the server markup, and the route plays in as before. When the first route can't be resolved synchronously (async `getStaticProps` without `initialStaticProps`), the Stack still adds it in the client side effect.
