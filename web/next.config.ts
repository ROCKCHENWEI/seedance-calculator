import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Prefer this repo as Turbopack root when a parent folder has another package-lock.json
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/skilltable-skills.json",
        destination: "/api/well-known/skilltable-skills",
      },
    ];
  },
};

export default nextConfig;
