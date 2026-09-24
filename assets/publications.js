(function () {
  const script = document.currentScript;
  const root = script.dataset.root;
  const member = script.dataset.member;
  const mode = script.dataset.mode || 'member';
  const remote = script.dataset.remote === 'true';
  const members = ['sadok', 'serkan', 'maximilian', 'devender', 'yekta', 'riccardo', 'aisha', 'rebecca'];
  const profileRoots = {
    sadok: 'https://raw.githubusercontent.com/SDU-Data-and-Intelligence-Lab/sadok/master/data/publications',
    maximilian: 'https://raw.githubusercontent.com/SDU-Data-and-Intelligence-Lab/maximilian/master/data/publications',
    devender: 'https://raw.githubusercontent.com/SDU-Data-and-Intelligence-Lab/devender/master/data/publications',
    yekta: 'https://raw.githubusercontent.com/SDU-Data-and-Intelligence-Lab/yekta/master/data/publications',
    aisha: 'https://raw.githubusercontent.com/SDU-Data-and-Intelligence-Lab/aisha/main/data/publications',
    rebecca: 'https://raw.githubusercontent.com/SDU-Data-and-Intelligence-Lab/rebecca/master/data/publications'
  };

  function sortPublications(items) {
    return items.slice().sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function renderMember(items) {
    const aboutView = mode === 'about';
    const target = document.querySelector(aboutView ? '.profile-publications-list' : '.archive-list');
    if (!target) return;
    target.innerHTML = sortPublications(items).slice(0, 3).map((item) =>
      '<article class="archive-item">' +
      '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<p>' + escapeHtml(item.authors) + '</p>' +
      '<p>' + escapeHtml(item.venue) + (item.year ? ', ' + escapeHtml(item.year) : '') + '</p>' +
      '</article>'
    ).join('');
    if (!items.length) {
      target.innerHTML = '<div class="empty-state">No publications are currently listed.</div>';
    }
  }

  function renderArchive(items) {
    const target = document.querySelector('.publication-shell');
    if (!target) return;
    const unique = Array.from(new Map(items.filter((item) => {
      const cutoff = item._member === 'serkan' ? 2023 : 2024;
      return Number(item.year) >= cutoff;
    }).map((item) => [item.url, item])).values());
    const years = [...new Set(unique.map((item) => Number(item.year)))].sort((a, b) => b - a);
    target.innerHTML = years.map((year) =>
      '<section class="publication-list-year">' +
      '<h2 class="publication-list-year-label">' + year + '</h2>' +
      '<div class="publication-list-items">' +
      sortPublications(unique.filter((item) => Number(item.year) === year)).map((item) =>
          '<article class="publication-list-entry">' +
        '<h3><a class="card-title-link" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p class="publication-meta">' + escapeHtml(item.authors) + ' &middot; ' + escapeHtml(item.venue) + '</p>' +
        '</article>'
      ).join('') +
      '</div></section>'
    ).join('');
  }

  const requested = mode === 'archive' ? members : [member];
  const urls = requested.map((slug) =>
    (remote ? (profileRoots[slug] || root) : root) + '/' + slug + '.json');
  const cacheKey = 'lab-publications-v1:' + JSON.stringify(urls);
  const validList = (items) => Array.isArray(items) && items.every((item) =>
    item && typeof item.title === 'string' && typeof item.url === 'string' &&
    typeof item.authors === 'string' && typeof item.venue === 'string' &&
    Number.isFinite(Number(item.year)));
  let cached = null;
  try {
    const saved = JSON.parse(localStorage.getItem(cacheKey));
    if (Array.isArray(saved) && saved.length === urls.length && saved.every(validList)) {
      cached = saved;
    }
  } catch (_) {
    // Storage can be unavailable in private browsing.
  }

  function renderLists(lists) {
    const items = mode === 'archive'
      ? lists.flatMap((list, index) => list.map((item) => ({ ...item, _member: requested[index] })))
      : lists.flat();
    if (mode === 'archive') renderArchive(items);
    else renderMember(items);
  }
  if (cached) renderLists(cached);

  Promise.all(urls.map(async (url, index) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Could not load publications');
      const items = await response.json();
      if (!validList(items)) throw new Error('Invalid publication data');
      return items;
    } catch (error) {
      if (cached) return cached[index];
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  })).then((lists) => {
    renderLists(lists);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(lists));
    } catch (_) {
      // Rendering does not depend on storage being available.
    }
  }).catch(() => {
    // Preserve the complete existing archive if a first-time request fails.
  });
}());
