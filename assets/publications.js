(function () {
  const script = document.currentScript;
  const root = script.dataset.root;
  const member = script.dataset.member;
  const mode = script.dataset.mode || 'member';
  const members = ['sadok', 'serkan', 'maximilian', 'devender', 'yekta', 'riccardo', 'rebecca'];

  function sortPublications(items) {
    return items.slice().sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function renderMember(items) {
    const target = document.querySelector('.archive-list');
    if (!target) return;
    target.innerHTML = sortPublications(items).map((item) =>
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
    const unique = Array.from(new Map(items.map((item) => [item.url, item])).values());
    const years = [...new Set(unique.map((item) => Number(item.year)))].sort((a, b) => b - a);
    target.innerHTML = years.map((year) =>
      '<section class="publication-year-row">' +
      '<div class="publication-year-panel"><h2 class="publication-year">' + year + '</h2></div>' +
      '<div class="publication-year-content">' +
      sortPublications(unique.filter((item) => Number(item.year) === year)).map((item) =>
        '<article class="publication-entry">' +
        '<h3><a class="card-title-link" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p class="publication-meta">' + escapeHtml(item.authors) + ' &middot; ' + escapeHtml(item.venue) + '</p>' +
        '</article>'
      ).join('') +
      '</div></section>'
    ).join('');
  }

  const requested = mode === 'archive' ? members : [member];
  Promise.all(requested.map((slug) => fetch(root + '/' + slug + '.json').then((response) => {
    if (!response.ok) throw new Error('Could not load ' + slug + ' publications');
    return response.json();
  }))).then((lists) => {
    const items = lists.flat();
    if (mode === 'archive') renderArchive(items);
    else renderMember(items);
  }).catch(() => {
    // The original HTML remains visible if data loading fails.
  });
}());
