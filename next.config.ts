import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  // 图片域名配置（OSS 等）
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.aliyuncs.com' },
      { protocol: 'https', hostname: '**.minimax.io' },
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
    ],
  },

  // AWS Amplify 需要的安全头部
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
