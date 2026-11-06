import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { generateSeo } from './scripts/generate-seo.mjs'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    // 构建完成后生成分发三件套:每篇文章静态落地页 + rss + sitemap + robots
    {
      name: 'generate-seo',
      closeBundle: () => generateSeo(),
    },
  ],
})
