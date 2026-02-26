import { resolve } from "node:path";
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "eqid19xi",
    dataset: "production",
  },
  typegen: {
    path: "./src/sanity/**/*.{ts,tsx,js,jsx}",
    schema: "./schema.json",
    generates: "./sanity.types.ts",
  },
  vite: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": resolve(__dirname, "src"),
      },
    },
  }),
});
