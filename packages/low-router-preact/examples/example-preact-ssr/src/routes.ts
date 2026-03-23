import { lazy } from "preact/compat"
import HomePage from "~/src/pages/HomePage"
import WorkPage from "~/src/pages/WorkPage"
const AboutPage = lazy(() => import("~/src/pages/AboutPage"))
import NotFoundPage from "~/src/pages/NotFoundPage"
import FooPage from "~/src/pages/FooPage"
import BarPage from "~/src/pages/BarPage"
import AAPage from "~/src/pages/AAPage"
import BBPage from "~/src/pages/BBPage"
import CCPage from "~/src/pages/CCPage"
import DDPage from "~/src/pages/DDPage"
import HomeSubAPage from "~/src/pages/HomeSubAPage"
import HomeSubBPage from "~/src/pages/HomeSubBPage"
import { Locale } from "@wbe/low-router-preact"
import { Route } from "@wbe/low-router"

export const routes = [
  {
    path: "/",
    name: "home",
    action: () => HomePage,
    getStaticProps: async (context, locale) => {
      return {
        title: `hello home ${locale.code}`,
      }
    },
    children: [
      {
        path: "",
        name: "home-sub-root",
      },
      {
        path: "/home-sub-a",
        translations: {
          en: "/home-sub-a",
          fr: "/accueil-sous-page-a",
        },
        name: "home-sub-a",
        action: () => HomeSubAPage,
      },
      {
        path: "/home-sub-b",
        name: "home-sub-b",
        action: () => HomeSubBPage,
      },
    ],
  },
  {
    path: null,
    translations: {
      en: "/about",
      fr: "/a-propos",
    },
    name: "about",
    getStaticProps: async (context, locale: Locale) => ({
      title: "hello About",
    }),
    action: () => AboutPage,
    children: [
      {
        path: "",
        name: "root-about",
      },
      {
        path: "/foo",
        name: "foo",
        action: () => FooPage,
      },
      {
        path: "/bar",
        name: "bar",
        action: () => BarPage,
        children: [
          {
            path: "",
            name: "root-bar",
          },
          {
            path: "/aa",
            name: "aa",
            action: () => AAPage,
          },
          {
            path: "/bb",
            name: "bb",
            action: () => BBPage,
            getStaticProps: async (context, locale) => ({
              title: `hello BBPage (static props) ${locale.code}`,
            }),
            children: [
              {
                path: "",
                name: "root-bb",
              },
              {
                path: "context",
                name: "cc",
                action: () => CCPage,
                getStaticProps: async (context, locale) => ({
                  title: `CC Page ${locale.code}`,
                }),
              },
              {
                path: "/dd",
                name: "dd",
                action: () => DDPage,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/work/:id",
    translations: {
      en: "/work/:id",
      fr: "/projet/:id",
    },
    name: "work",
    action: () => WorkPage,
  },
  {
    path: "/:404*",
    name: "not-found",
    action: () => NotFoundPage,
  },
] as const satisfies Route[]

/**
 * Locale
 */
export const locales: Locale[] = [{ code: "fr" }, { code: "en" }]
export const defaultLocaleInUrl = false
