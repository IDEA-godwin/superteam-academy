import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

const withNextInt = createNextIntlPlugin()

export default withNextInt(nextConfig);


