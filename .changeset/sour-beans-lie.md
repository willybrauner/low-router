---
"@wbe/low-router-preact": minor
---

Patch missing route props on \_props copy

reference to #56

In case the route didn't had a specific props object, `_props` was `undefined`, and last `route.props` of the same route was registered in `route._props` object. To avoid this behavior, we set an empty object on `props.route` if no props exist on the initial route object.
