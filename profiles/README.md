# Member profile editing

Each member profile has three files:

- `index.html` for the About page
- `publications.html` for selected publications
- `teaching.html` for teaching information

Use the **Edit this page on GitHub** link at the bottom of a profile page to open the relevant file. Commit directly only when authorised to do so; otherwise create a pull request for review.

## Adding a publication

Replace the empty-state message in `publications.html` with an archive list:

```html
<div class="archive-list">
  <article class="archive-item">
    <h2><a href="PAPER_URL">Paper title</a></h2>
    <p>Author names</p>
    <p>Venue, year</p>
  </article>
</div>
```

The shared visual design is in `profiles/profile.css`. Changes to that file affect every hosted member profile.
