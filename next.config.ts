import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // Serve the static heatmap at /erschliessung/heatmap (without .html).
      // The file lives at public/erschliessung/heatmap/index.html, regenerated
      // by Erschliessung/evaluation_runs/build_cycles_heatmap_html.py.
      { source: '/erschliessung/heatmap', destination: '/erschliessung/heatmap/index.html' },
    ];
  },
  async redirects() {
    return [
      // Legacy URL — anyone with the old link gets bounced to the clean URL.
      { source: '/erschliessung/heatmap.html', destination: '/erschliessung/heatmap', permanent: true },
    ];
  },
};

export default nextConfig;
