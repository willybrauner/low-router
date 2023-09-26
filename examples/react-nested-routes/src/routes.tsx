import { About } from "./pages/About.tsx"
import { Foo } from "./pages/Foo.tsx"

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
        //   action: () => <Foo />,
        //   children: [
        //     // need to match on /about on sub router
        //     {
        //       path: "",
        //       action: () => null,
        //     },
        //     {
        //       path: "/a",
        //       name: "a",
        //       action: () => <div>a</div>,
        //     },
        //     {
        //       path: "/b",
        //       name: "b",
        //       action: () => <div>b</div>,
        //     },
        //   ],
      },
      {
        path: "/bar",
        name: "bar",
        action: () => <div>bar</div>,
      },
    ],
  },
  {
    path: "/contact",
    name: "contact",
    action: () => <div>contact</div>,
  },
]
