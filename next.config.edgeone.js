/**
 * @type {import('next').NextConfig}
 * @description 专为 EdgeOne.ai 部署优化的 Next.js 配置文件。
 * 本配置启用静态导出 (output: 'export')，适用于无服务器或静态托管环境。
 * 注意：API 路由 (API Routes) 在此模式下将被忽略，需通过外部服务（如 Pages Functions）实现。
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const nextConfig = {
  // === ESLint 配置 ===
  eslint: {
    dirs: ['src'], // 指定需要 ESLint 检查的目录
  },

  // === React 和构建优化 ===
  reactStrictMode: true, // 启用 React 严格模式，帮助发现潜在问题
  swcMinify: true,      // 使用 SWC 进行更快的代码压缩

  // === 静态导出配置 ===
  // 将应用构建为静态 HTML 文件，适用于 CDN 或静态托管。
  output: 'export',
  // 注意：trailingSlash: true 会为每个页面生成一个目录（如 /about/），
  // 这在某些静态托管服务上可能导致路由问题。如果遇到 404，建议设为 false。
  trailingSlash: false, // 推荐设置，生成 /about.html 而非 /about/index.html

  // === 图片优化配置 ===
  // 由于是静态导出，且可能引用任意域名的图片，我们禁用 Next.js 的图片优化。
  // 这样就不需要配置 remotePatterns 白名单，简化部署。
  images: {
    unoptimized: true, // ✅ 关键：禁用优化，允许所有图片源
    // 注意：remotePatterns 不支持通配符如 '**'。如果需要白名单，
    // 请移除 unoptimized: true 并在此处列出确切的域名，例如：
    /*
    remotePatterns: [
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
    */
  },

  // === Webpack 自定义配置 ===
  webpack(config) {
    // 禁用缓存以确保每次构建都是全新的，避免缓存导致的潜在问题。
    config.cache = false;

    // 查找 Next.js 内部用于处理静态文件（如 .svg, .png）的默认规则
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    // ⚠️ 增加健壮性检查：确保找到了规则，避免因规则不存在而导致构建崩溃
    if (fileLoaderRule) {
      // 1. 为 *.svg?url 这种导入方式保留原有的 file-loader 行为
      config.module.rules.push({
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // 匹配查询参数为 url 的 SVG
      });

      // 2. 将其他所有 SVG 导入（如 import Logo from './logo.svg'）转换为 React 组件
      config.module.rules.push({
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ }, // 排除在 CSS 中作为背景图使用的 SVG
        resourceQuery: { not: /url/ },         // 排除 *.svg?url 这种导入
        loader: '@svgr/webpack',               // 使用 @svgr/webpack 处理器
        options: {
          dimensions: false, // 不自动设置 width/height 属性
          titleProp: true,   // 将 SVG 的 title 属性映射为 React 组件的 title prop
        },
      });

      // 3. 修改原始的 file-loader 规则，排除 .svg 文件，因为我们已经用上面的规则处理了
      fileLoaderRule.exclude = /\.svg$/i;
    } else {
      // 如果未找到规则，发出警告（通常不会发生，但以防万一）
      console.warn('Warning: Could not find the default file loader rule for SVGs.');
    }

    return config;
  },

  // === Telemetry (遥测) 配置 ===
  // Next.js 会收集完全匿名的使用数据（如命令、版本、插件、构建性能），以帮助改进框架。
  // 此行为是可选的，您可以通过运行 `npx next telemetry disable` 来选择退出。
  // 收集的数据不包含任何敏感信息（如环境变量、文件内容、个人身份信息）。
  // 了解更多：https://nextjs.org/telemetry
  // telemetryEnabled: true, // 默认为 true，可显式设置
};

// 为 EdgeOne.ai 配置静态导出，API 功能需通过外部服务（如 Pages Functions）实现
module.exports = nextConfig;
