/**
 * 构建期 SEO 生成器(零依赖,node 标准库)。
 *
 * 背景:miniflow 用 HashRouter,爬虫抓不到 #/article/:id 的内容——13 篇真实
 * 文章几乎零分发能力。这个脚本在 vite build 之后(closeBundle 钩子)做三件事:
 *
 *   1. dist/article/<id>/index.html —— 每篇的静态落地页:完整 OG/Twitter 卡片
 *      标签 + 正文快照(给爬虫和禁 JS 的读者),人类访问 0 秒跳转到应用内阅读
 *   2. dist/rss.xml + dist/sitemap.xml + dist/robots.txt —— 分发三件套
 *
 * 运行时零改动:这些全是构建产物,不影响应用本身。
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentPosts } from '../src/content/posts.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://wjh941.github.io/miniflow/';

/** markdown → 纯文本摘要(去标记,取前 120 字) */
function toExcerpt(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_\-\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

/** markdown → 简单 HTML(段落 + h2,转义所有 HTML 字符;给落地页正文快照) */
function toStaticHtml(markdown) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const blocks = markdown
    .replace(/```[\s\S]*?```/g, '\n（代码块见应用内阅读）\n')
    .split(/\n{2,}/)
    .map((block) => {
      const b = block.trim();
      if (!b) return '';
      if (b.startsWith('## ')) return `<h2>${esc(b.slice(3))}</h2>`;
      const inline = esc(b).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      return `<p>${inline}</p>`;
    });
  return blocks.join('\n');
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function articlePage(post) {
  const url = `${SITE}article/${post.id}/`;
  const appUrl = `${SITE}#/article/${post.id}`;
  const excerpt = toExcerpt(post.content);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeXml(post.title)} · MiniFlow</title>
<meta name="description" content="${escapeXml(excerpt)}">
<meta name="tags" content="${escapeXml(post.tags.join(','))}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeXml(post.title)}">
<meta property="og:description" content="${escapeXml(excerpt)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="MiniFlow 轻博客">
<meta property="article:published_time" content="${post.createdAt}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeXml(post.title)}">
<meta name="twitter:description" content="${escapeXml(excerpt)}">
<meta http-equiv="refresh" content="0; url=${appUrl}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":${JSON.stringify(post.title)},"datePublished":"${post.createdAt}","url":"${url}","description":${JSON.stringify(excerpt)},"keywords":${JSON.stringify(post.tags.join(','))}}
</script>
</head>
<body>
<article>
<h1>${escapeXml(post.title)}</h1>
<p><time>${post.createdAt}</time> · ${escapeXml(post.tags.join(' / '))}</p>
${toStaticHtml(post.content)}
</article>
<noscript><p><a href="${appUrl}">在 MiniFlow 应用中阅读这篇文章 →</a></p></noscript>
<script>location.replace(${JSON.stringify(appUrl)});</script>
</body>
</html>
`;
}

export function generateSeo({ outDir = DIST, site = SITE } = {}) {
  const now = new Date().toUTCString();

  // 每篇文章的静态落地页
  for (const post of contentPosts) {
    const dir = join(outDir, 'article', post.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), articlePage(post, site));
  }

  // RSS 2.0:链接指向静态落地页(爬虫可抓),落地页再跳应用
  const items = contentPosts.map((p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${site}article/${p.id}/</link>
      <guid isPermaLink="true">${site}article/${p.id}/</guid>
      <pubDate>${new Date(`${p.createdAt}T12:00:00+08:00`).toUTCString()}</pubDate>
      <description>${escapeXml(toExcerpt(p.content))}</description>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('')}
    </item>`).join('\n');
  writeFileSync(join(outDir, 'rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MiniFlow 轻博客</title>
    <link>${site}</link>
    <description>把想法做成能跑、能测、能卖的真实产品——项目复盘与技术随笔</description>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>miniflow generate-seo</generator>
${items}
  </channel>
</rss>
`);

  // sitemap + robots
  const urls = [
    `  <url><loc>${site}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...contentPosts.map((p) => `  <url><loc>${site}article/${p.id}/</loc><lastmod>${p.createdAt}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
  ];
  writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`);
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}sitemap.xml\n`);

  return { articles: contentPosts.length, files: contentPosts.length + 3 };
}

// 直接运行时也能生成(npm run build 之外的手动验证入口)
if (process.argv[1] && process.argv[1].endsWith('generate-seo.mjs')) {
  const result = generateSeo();
  console.log(`generate-seo: ${result.articles} 篇落地页 + rss/sitemap/robots 已写入 dist/`);
}
