/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-var-requires */
const nextConfig = {
  // standalone 用于 Node.js 服务部署（如 Docker）
  output: 'standalone',

  // 启用 ESLint 检查
  eslint: {
    dirs: ['src'],
  },

  // React 严格模式（可选）
  reactStrictMode: false,

  // 使用 SWC 进行更快的压缩
  swcMinify: true,

  // 图片配置：禁用优化，避免 remotePatterns 问题
  images: {
    unoptimized: true,
    // 如果需要白名单，请替换为具体域名，例如：
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'example.com' },
    //   { protocol: 'https', hostname: 'cdn.example.com' },
    // ],
  },

  // 自定义 Webpack 配置
  webpack(config) {
    // 处理 SVG：支持 ?url 和 @svgr/webpack
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url -> file-loader
        },
        {
          test: /\.svg$/i,
          issuer: { not: /\.(css|scss|sass)$/ },
          resourceQuery: { not: /url/ }, // 其他 SVG -> React 组件
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
            titleProp: true,
          },
        }
      );

      // 防止 file-loader 处理已被 svgr 处理的 SVG
      fileLoaderRule.exclude = /\.svg$/i;
    } else {
      console.warn('Warning: Could not find default file loader for SVG. SVG as React components may not work.');
    }

    // 处理 Node.js 原生模块在浏览器中的缺失
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      crypto: false,
      fs: false,
      child_process: false,
    };

    return config;
  },

  // 可选：关闭 telemetry
  // telemetryEnabled: false,
};

// ================================
// ⚠️ 注意：next-pwa 与 standalone 模式有兼容性问题
// 推荐方案：手动注册 service worker 或使用其他 PWA 方案
// ================================
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
// });
// module.exports = withPWA(nextConfig);

// 直接导出配置（不使用 PWA 包装器）
module.exports = nextConfig;
