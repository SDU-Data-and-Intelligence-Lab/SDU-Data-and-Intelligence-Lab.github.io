import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = 'https://ricter22.github.io/publications/';
const targetPath = 'data/publications/riccardo.json';

function decodeHtml(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error('Could not fetch Riccardo\'s publications: ' + response.status);
const html = await response.text();
const articles = [...html.matchAll(/<article class="publication-entry"[\s\S]*?<\/article>/g)];

const publications = articles.map((match) => {
  const article = match[0];
  const titleMatch = article.match(/<h2[^>]*><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
  const authorsMatch = article.match(/<p class="publication-authors">([\s\S]*?)<\/p>/);
  const venueMatch = article.match(/<p class="publication-venue">([\s\S]*?)<\/p>/);
  const published = decodeHtml(venueMatch?.[1] || '');
  const authors = decodeHtml(authorsMatch?.[1] || '').replace(/\s+/g, ' ');
  const yearMatch = published.match(/\b(20\d{2})\b/);

  if (!titleMatch || !authorsMatch || !venueMatch || !yearMatch) {
    throw new Error('Could not parse a Riccardo publication');
  }

  return {
    year: Number(yearMatch[1]),
    title: decodeHtml(titleMatch[2]),
    authors,
    venue: published,
    url: new URL(titleMatch[1], sourceUrl).href
  };
}).filter((item) => item.year >= 2023);

if (!publications.length) throw new Error('No Riccardo publications were parsed');

const next = JSON.stringify(publications, null, 2) + '\n';
const current = await readFile(targetPath, 'utf8').catch(() => '');
if (current !== next) await writeFile(targetPath, next, 'utf8');
