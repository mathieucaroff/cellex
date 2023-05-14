import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import nearley from "./vite-plugin-nearley"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nearley(), react()],
})
