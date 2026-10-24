import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Covers and previews are pre-sized WebP files in public/, served straight
    // from the CDN. next/image would route each one through the paid image
    // optimizer, which is the first quota to run out under heavy traffic.
    rules: { "@next/next/no-img-element": "off" },
  },
]);

export default eslintConfig;
