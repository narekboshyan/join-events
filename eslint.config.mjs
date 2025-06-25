import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("eslint:recommended", "next"),
  {
    plugins: {
      "unused-imports": unusedImports,
      "@typescript-eslint": typescriptEslint,
      prettier,
    },

    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ["**/*"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-shadow": "off",
      "unused-imports/no-unused-imports": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          reportUsedIgnorePattern: false,
        },
      ],
      "no-unused-exports/no-unused-vars": "off",
      "no-shadow": "off",
      "no-undef": "off",
      "import/no-cycle": "error",

      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],

      "import/order": [
        "error",
        {
          groups: [
            ["external", "builtin"],
            "internal",
            ["sibling", "parent"],
            "index",
          ],

          pathGroups: [
            {
              pattern: "@(next|react)",
              group: "external",
              position: "before",
            },
            {
              pattern: "@src/**",
              group: "internal",
            },
          ],

          pathGroupsExcludedImportTypes: ["internal", "react"],
          "newlines-between": "never",

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
