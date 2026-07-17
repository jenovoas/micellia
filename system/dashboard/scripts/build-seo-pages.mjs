#!/usr/bin/env node
/**
 * Genera una versión HTML estática de cada artículo Markdown y el sitemap.
 *
 * Uso local (URL temporal):
 *   node scripts/build-seo-pages.mjs
 *
 * Uso al migrar al dominio propio:
 *   SITE_URL=https://micelia.cl SITE_BASE_PATH=/ node scripts/build-seo-pages.mjs
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const dashboardDir = dirname(dirname(new URL(import.meta.url).pathname));
const docsDir = join(dashboardDir, 'docs');
const outputDir = join(dashboardDir, 'articulos');
const siteUrl = (process.env.SITE_URL || 'https://pinguinoseguro.cl').replace(/\/$/, '');
const basePath = normalizeBasePath(process.env.SITE_BASE_PATH || '/micelia');
const siteBaseUrl = `${siteUrl}${basePath}`;

function normalizeBasePath(value) {
    if (!value || value === '/') return '';
    return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function inline(markdown) {
    let html = escapeHtml(markdown.trim());
    html = html.replace(/!\[([^\]]*)\]\(([^ )]+)(?: "[^"]*")?\)/g, (_, alt, src) =>
        `<img src="${basePath}/${escapeHtml(src).replace(/^\//, '')}" alt="${alt}" loading="lazy">`);
    html = html.replace(/\[([^\]]+)\]\(([^ )]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return html;
}

function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r/g, '').split('\n');
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        if (!line.trim() || /^---+$/.test(line.trim())) { index++; continue; }

        if (line.startsWith('```')) {
            const code = [];
            index++;
            while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
            if (index < lines.length) index++;
            blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            const level = heading[1].length;
            blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
            index++;
            continue;
        }

        if (/^!\[/.test(line.trim())) {
            blocks.push(`<figure>${inline(line)} </figure>`);
            index++;
            continue;
        }

        const listMatch = line.match(/^([-*+] |\d+\. )(.+)$/);
        if (listMatch) {
            const ordered = /^\d+\. /.test(line);
            const items = [];
            while (index < lines.length) {
                const item = lines[index].match(ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/);
                if (!item) break;
                items.push(`<li>${inline(item[1])}</li>`);
                index++;
            }
            blocks.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
            continue;
        }

        const paragraph = [];
        while (index < lines.length && lines[index].trim() && !/^---+$/.test(lines[index].trim()) &&
            !/^(#{1,6})\s+/.test(lines[index]) && !lines[index].startsWith('```') &&
            !/^!\[/.test(lines[index].trim()) && !/^([-*+] |\d+\. )/.test(lines[index])) {
            paragraph.push(lines[index++]);
        }
        blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
    }
    return blocks.join('\n');
}

function articleTemplate({ title, description, content, canonical, category }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} · Micelia</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="es_CL">
    <meta property="og:site_name" content="Micelia">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <link rel="stylesheet" href="${basePath}/public.css?v=2">
    <style>
        .seo-article { max-width: 880px; margin: 0 auto; padding: 7rem 1.5rem 4rem; }
        .seo-article__meta { color: var(--accent-green-light); font-size: .9rem; }
        .seo-article .prose { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 2.5rem; line-height: 1.8; }
        .seo-article figure { margin: 2rem 0; }
        .seo-article figure img { width: 100%; border-radius: 14px; }
        .seo-article pre { white-space: pre-wrap; overflow-wrap: anywhere; padding: 1rem; border-radius: 10px; background: rgba(0,0,0,.3); }
        .seo-article a { color: var(--accent-gold); }
    </style>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":${JSON.stringify(title)},"description":${JSON.stringify(description)},"inLanguage":"es-CL","publisher":{"@type":"Organization","name":"Micelia","url":${JSON.stringify(siteBaseUrl)}},"mainEntityOfPage":${JSON.stringify(canonical)}}</script>
</head>
<body>
    <main class="seo-article">
        <p><a href="${basePath}/biblioteca.html">← Biblioteca Micelia</a></p>
        <p class="seo-article__meta">${escapeHtml(category)}</p>
        <article class="prose">${content}</article>
    </main>
</body>
</html>`;
}

const files = (await readdir(docsDir)).filter(file => file.endsWith('.md')).sort();
await rm(outputDir, { recursive: true, force: true });
const urls = [`${siteBaseUrl}/`, `${siteBaseUrl}/biblioteca.html`];

for (const file of files) {
    const markdown = await readFile(join(docsDir, file), 'utf8');
    const title = (markdown.match(/^#\s+(.+)$/m)?.[1] || file.replace(/\.md$/, '')).trim();
    const category = markdown.match(/^\*Categoría:\s*([^·*]+)/m)?.[1].trim() || 'Biblioteca Micelia';
    const plainText = markdown
        .replace(/^#.+$/gm, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/[`*_>#-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const description = plainText.slice(0, 155).replace(/[,:;\-\s]+$/, '') + (plainText.length > 155 ? '…' : '');
    const slug = file.replace(/\.md$/, '');
    const canonical = `${siteBaseUrl}/articulos/${encodeURIComponent(slug)}/`;
    const directory = join(outputDir, slug);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), articleTemplate({
        title,
        description,
        content: markdownToHtml(markdown),
        canonical,
        category,
    }));
    urls.push(canonical);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(dashboardDir, 'sitemap.xml'), sitemap);
console.log(`Generados ${files.length} artículos estáticos y sitemap.xml para ${siteBaseUrl}`);
