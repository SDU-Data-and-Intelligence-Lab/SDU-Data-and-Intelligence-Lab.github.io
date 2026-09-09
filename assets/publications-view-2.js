(function () {
  const script = document.currentScript;
  const root = script.dataset.root;
  const members = ['sadok', 'serkan', 'maximilian', 'devender', 'yekta', 'riccardo', 'rebecca'];
  const directions = [
    'AI & Information Retrieval',
    'LLM-in-the-middle for Physical AI',
    'AI interpretability',
    'Multimodal AI and environmental monitoring',
    'NLP and semantic password forensics',
    'Digital health and wearable sensing'
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function directionFor(item, slug) {
    const title = item.title.toLowerCase();
    if (slug === 'riccardo' || /retrieval|rag|dataset|graph|table search|pseudoquer/.test(title)) return directions[0];
    if (slug === 'maximilian' || /password|semantic/.test(title)) return directions[4];
    if (slug === 'devender' || slug === 'yekta' || /health|stress|physical activity|wearable|chest x-ray/.test(title)) return directions[5];
    if (/segmentation|environment|fruit|inundation|monitoring/.test(title)) return directions[3];
    if (slug === 'sadok') return directions[1];
    return directions[2];
  }

  function loadMember(slug) {
    return fetch(root + '/' + slug + '.json').then((response) => {
      if (!response.ok) throw new Error('Could not load ' + slug + ' publications');
      return response.json();
    }).then((items) => items.map((item) => ({
      ...item,
      direction: item.direction || directionFor(item, slug)
    })));
  }

  Promise.all(members.map(loadMember)).then((lists) => {
    const unique = Array.from(new Map(lists.flat().filter((item) => Number(item.year) >= 2024).map((item) => [item.url, item])).values());
    const target = document.querySelector('.publication-direction-shell');
    if (!target) return;
    target.innerHTML = directions.map((direction) => {
      const items = unique
        .filter((item) => item.direction === direction)
        .sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));
      if (!items.length) return '';
      return '<section class="publication-direction-row">' +
        '<div class="publication-direction-panel"><h2>' + escapeHtml(direction) + '</h2></div>' +
        '<div class="publication-direction-content">' +
        items.map((item) =>
          '<article class="publication-entry">' +
          '<time class="publication-entry-year" datetime="' + escapeHtml(item.year) + '">' + escapeHtml(item.year) + '</time>' +
          '<div class="publication-entry-body"><h3><a class="card-title-link" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="publication-meta">' + escapeHtml(item.authors) + ' &middot; ' + escapeHtml(item.venue) + '</p></div>' +
          '</article>'
        ).join('') +
        '</div></section>';
    }).join('');
  });
}());
