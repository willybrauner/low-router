---
"@wbe/low-router-preact": patch
---

Resolve the first route synchronously on client first render (hydration)

On the server, the root Router resolves the first route during render, but on the client `currentContext` was only set in an effect. Components reading `currentContext` rendered another markup on the first client render than on the server (hydration mismatch).

The root Router now resolves the first route synchronously on client first render when its props are already known (`initialStaticProps` available for this url, or no `getStaticProps`). Otherwise, the first route is still resolved in the client side effect.
