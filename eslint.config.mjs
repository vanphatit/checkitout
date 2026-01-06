import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript"
  ),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // 🔥 CUSTOM RULE OVERRIDE
  {
    rules: {
      // ===== TypeScript =====
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }
      ],

      // ===== React =====
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",

      // ===== Next.js =====
      "@next/next/no-img-element": "off",

      // ===== General =====
      "no-console": "off",
    },
  },
];

export default eslintConfig;
