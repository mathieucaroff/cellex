import * as child from "child_process"
import * as path from "path"

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    COMMIT_HASH: child.execSync("git rev-parse --short HEAD").toString().trim(),
  },
  webpack: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.md$/i,
            use: ["raw-loader"],
          },
          {
            test: /\.ne$/i,
            use: [
              {
                loader: path.resolve("nearleyLoader.mjs"),
              },
            ],
          },
        ],
      },
    }
  },
}

export default nextConfig
