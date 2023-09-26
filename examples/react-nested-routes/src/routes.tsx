import { About } from "./pages/About.tsx"

export const routes = [
  {
    path: "/",
    name: "home",
    action: () => <div>home</div>,
  },
  {
    path: "/about",
    name: "about",
    action: () => <About />,
    children: [
      // need to match on /about on sub router
      {
        path: "",
        action: () => null,
      },
      {
        path: "/foo",
        name: "foo",
        action: () => <div>foo</div>,
      },
      {
        path: "/bar",
        name: "bar",
        action: () => <div>bar</div>,
      },
    ],
  },
]
