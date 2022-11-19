export default {
  title: "Aidbox NodeJS SDK",
  description: "NodeJS SDK for build App on top of Aidbox",
  base: "/node-server-sdk/",
  themeConfig: {
    editLink: {
      pattern: "https://github.com/Aidbox/node-server-sdk/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Getting Started", link: "/concept" },
        ],
      },
      {
        text: "Usage",
        items: [
          { text: "Example Application", link: "/usage/" },
          { text: "Application", link: "/usage/application" },
          { text: "Config", link: "/usage/config" },
          { text: "Manifest", link: "/usage/manifest" },
          { text: "Operation", link: "/usage/operation" },
          { text: "Healthcheck", link: "/usage/healthcheck" },
          { text: "Typescript Support", link: "/usage/typescript" },
        ],
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2022-present HealthSamurai",
    },
  },
};
