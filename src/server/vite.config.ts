import { defineConfig } from "vite"
import { VitePluginNode } from "vite-plugin-node"

import nearley from "../../vite-plugin-nearley"

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ...VitePluginNode({
      adapter: "fastify",
      appPath: "./server.ts",
      exportName: "fastify",
    }),
    nearley(),
  ],
})
