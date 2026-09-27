# Showcase maintenance

- Keep product claims factual and distinguish an empty workspace from a completed practice result.
- This static site uses `index.html`, `styles.css` and existing public assets; it has no package manifest or application test suite.
- Preview with `python -m http.server 55011 --bind 127.0.0.1`; inspect changed copy, images and navigation in Chrome and run `git diff --check`.
- Do not publish private application source, prompts, credentials or user practice data. Main-branch merge/publication requires owner approval.
