const path = require("path");
const { rules } = require("../../dist/utils/rules");

function ruleToLink({
  meta: {
    docs: { ruleId, ruleName },
  },
}) {
  return [`/rules/${ruleName}`, ruleId];
}

/** @type {Record<import("../../lib/types").RuleCategory | "deprecated", import("../../lib/types").RuleModule[]>} */
const categories = {
  "Best Practices": [],
  "Possible Errors": [],
  "Stylistic Issues": [],
  deprecated: [],
};

for (const rule of rules) {
  if (rule.meta.deprecated) {
    categories.deprecated.push(rule);
  } else {
    categories[rule.meta.docs.category].push(rule);
  }
}

module.exports = {
  base: "/eslint-plugin-css/",
  title: "eslint-plugin-css",
  description:
    "An ESLint plugin that provides rules to verify CSS definition objects.",
  serviceWorker: true,
  configureWebpack(_config, _isServer) {
    return {
      externals: {
        typescript: "typescript",
      },
      resolve: {
        alias: {
          esquery: path.resolve(
            __dirname,
            "../../node_modules/esquery/dist/esquery.min.js",
          ),
          "eslint-visitor-keys$": path.resolve(
            __dirname,
            "./shim/eslint-visitor-keys",
          ),
          "@eslint/eslintrc/universal": path.resolve(
            __dirname,
            "../../node_modules/@eslint/eslintrc/dist/eslintrc-universal.cjs",
          ),
          "eslint-compat-utils$": path.resolve(
            __dirname,
            "../../node_modules/eslint-compat-utils/dist/index.cjs",
          ),
        },
      },
    };
  },
  chainWebpack(config) {
    // In order to parse with webpack 4, the yaml package needs to be transpiled by babel.
    const jsRule = config.module.rule("js");
    const original = jsRule.exclude.values();
    jsRule.exclude
      .clear()
      .add((filepath) => {
        if (/node_modules\/(?:minimatch|yaml)\//u.test(filepath)) {
          return false;
        }
        for (const fn of original) {
          if (fn(filepath)) {
            return true;
          }
        }
        return false;
      })
      .end()
      .use("babel-loader");
  },

  head: [
    // ["link", { rel: "icon", type: "image/png", href: "/logo.png" }]
  ],
  themeConfig: {
    // logo: "/logo.svg",
    repo: "ota-meshi/eslint-plugin-css",
    docsRepo: "ota-meshi/eslint-plugin-css",
    docsDir: "docs",
    docsBranch: "main",
    editLinks: true,
    lastUpdated: true,
    serviceWorker: {
      updatePopup: true,
    },

    nav: [
      { text: "Introduction", link: "/" },
      { text: "User Guide", link: "/user-guide/" },
      { text: "Rules", link: "/rules/" },
      { text: "Settings", link: "/settings/" },
      { text: "Playground", link: "/playground/" },
    ],

    sidebar: {
      "/rules/": [
        "/rules/",
        {
          title: "Possible Errors",
          collapsable: false,
          children: categories["Possible Errors"].map(ruleToLink),
        },
        {
          title: "Best Practices",
          collapsable: false,
          children: categories["Best Practices"].map(ruleToLink),
        },
        {
          title: "Stylistic Issues",
          collapsable: false,
          children: categories["Stylistic Issues"].map(ruleToLink),
        },
        ...(categories.deprecated.length >= 1
          ? [
              {
                title: "Deprecated",
                collapsable: false,
                children: categories.deprecated.map(ruleToLink),
              },
            ]
          : []),
      ],
      "/": ["/", "/user-guide/", "/rules/", "/settings/", "/playground/"],
    },
  },
};
