// import react from "@vitejs/plugin-react"
import * as child from "child_process"
import { defineConfig } from "vite"

import nearley from "./vite-plugin-nearley"

const commitHash = child.execSync("git rev-parse --short HEAD").toString()

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [nearley()],
})
