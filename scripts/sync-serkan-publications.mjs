import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = 'https://sayvaz-mmmi.github.io/publications';
const targetPath = 'data/publications/serkan.json';
const fallbackUrl = sourceUrl;

function decodeHtml(value) {
  return value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/·/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error('Could not fetch Serkan\'s homepage: ' + response.status);
const html = await response.text();
const sections = [...html.matchAll(/<section class="year-group"><h2>(20\d{2})<\/h2><div class="archive-list">([\s\S]*?)<\/div><\/section>/g)];
if (!sections.length) throw new Error('Could not find Serkan\'s publication year groups');

const publications = sections.filter((section) => Number(section[1]) >= 2023).flatMap((section) => {
  const year = Number(section[1]);
  const articles = [...section[2].matchAll(/<article[^>]*>([\s\S]*?)<\/article>/g)];
  return articles.map((match) => {
    const article = match[1];
  const headingMatch = article.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
  const hrefMatch = headingMatch?.[1].match(/<a[^>]+href="([^"]+)"[^>]*>/);
  const titleMatch = headingMatch && [headingMatch[0], hrefMatch?.[1] || '', headingMatch[1].replace(/<a[^>]*>/, '').replace(/<\/a>/, '')];
  const authorsMatch = article.match(/<p class="paper-authors">([\s\S]*?)<\/p>/);
  const venueMatch = article.match(/<p class="paper-venue">([\s\S]*?)<\/p>/);
    const venue = decodeHtml(venueMatch?.[1] || '');

    if (!titleMatch || !authorsMatch || !venueMatch) {
      throw new Error('Could not parse a publication');
    }

    return {
      year,
      title: decodeHtml(titleMatch[2]),
      authors: decodeHtml(authorsMatch[1]),
      venue,
      url: titleMatch[1] ? decodeHtml(titleMatch[1]) : fallbackUrl
    };
  });
});

if (!publications.length) {
  throw new Error('No 2023+ publications were parsed');
}

const next = JSON.stringify(publications, null, 2) + '\n';
const current = await readFile(targetPath, 'utf8');
if (current !== next) await writeFile(targetPath, next, 'utf8');
