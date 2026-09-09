import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = 'https://sayvaz-mmmi.github.io/';
const targetPath = 'data/publications/serkan.json';
const fallbackUrl = 'https://sayvaz-mmmi.github.io/publications';

function decodeHtml(value) {
  return value
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
if (!response.ok) throw new Error('Could not fetch Serkan\'s homepage: ' + response.status);
const html = await response.text();
const selectedStart = html.indexOf('<h2>Selected publications</h2>');
const listStart = html.indexOf('<div class="archive-list">', selectedStart);
const listEnd = html.indexOf('</div></main>', listStart);

if (selectedStart < 0 || listStart < 0 || listEnd < 0) {
  throw new Error('Could not find the selected publications section');
}

const selectedHtml = html.slice(listStart, listEnd);
const articles = [...selectedHtml.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/g)];
const publications = articles.map((match) => {
  const article = match[1];
  const titleMatch = article.match(/<h3>(?:<a[^>]+href="([^"]+)"[^>]*>)?([\s\S]*?)(?:<\/a>)?<\/h3>/);
  const authorsMatch = article.match(/<p class="paper-authors">([\s\S]*?)<\/p>/);
  const venueMatch = article.match(/<p class="paper-venue">([\s\S]*?)<\/p>/);
  const venue = decodeHtml(venueMatch?.[1] || '');
  const yearMatch = venue.match(/\b(20\d{2})\b/);

  if (!titleMatch || !authorsMatch || !venueMatch || !yearMatch) {
    throw new Error('Could not parse a selected publication');
  }

  return {
    year: Number(yearMatch[1]),
    title: decodeHtml(titleMatch[2]),
    authors: decodeHtml(authorsMatch[1]),
    venue,
    url: titleMatch[1] || fallbackUrl
  };
});

if (!publications.length) throw new Error('No selected publications were parsed');

const next = JSON.stringify(publications, null, 2) + '\n';
const current = await readFile(targetPath, 'utf8');
if (current !== next) await writeFile(targetPath, next, 'utf8');
