import react from "@vitejs/plugin-react"
import * as child from "child_process"
import "dotenv/config"
import { defineConfig } from "vite"

import nearley from "./vite-plugin-nearley"

const commitHash = child.execSync("git rev-parse --short HEAD").toString().trim()

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __DISCORD_INVITE_URL__: JSON.stringify(process.env.DISCORD_INVITE_URL),
  },
  plugins: [nearley(), react()],
})
