import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, the empty
  // /Users/nathan/package-lock.json makes Turbopack infer the user's
  // home directory as the workspace and silently breaks the file
  // watcher (CSS variable edits don't trigger a rebuild).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
