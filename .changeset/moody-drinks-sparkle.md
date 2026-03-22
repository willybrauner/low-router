---
"@wbe/low-router-preact": patch
---

Fix sub-router playout transitions

When navigating to a parent route handled by a sub-router (no action), the Stack component fell into the "lazy" branch waiting for a ref that would never attach, since no component is rendered. This blocked the previous route's playout animation indefinitely.

The fix detects routes without an action and runs the transition immediately with null, allowing the previous route to properly play out.
