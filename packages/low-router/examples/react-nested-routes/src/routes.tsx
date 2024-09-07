import { About } from "./pages/About.tsx"
import { Foo } from "./pages/Foo.tsx"
import { A } from "./pages/A.tsx"

export const routes = [
  {
    path: "/",
    name: "home",
    action: () => "home",
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
        action: () => <Foo />,
        children: [
          // need to match on /about on sub router
          {
            path: "",
            action: () => null,
          },
          {
            path: "/a",
            name: "a",
            action: () => <A />,
            children: [
              // need to match on /about on sub router
              {
                path: "",
                action: () => null,
              },
              {
                path: "/c",
                name: "c",
                action: () => "c",
              },
              {
                path: "/d",
                name: "d",
                action: () => "d",
              },
            ],
          },
          {
            path: "/b",
            name: "b",
            action: () => "b",
          },
        ],
      },
      {
        path: "/bar",
        name: "bar",
        action: () => "bar",
      },
    ],
  },
  {
    path: "/contact",
    name: "contact",
    action: () => "contact",
  },
]
