# AutoSafeHarness — project website

A single-page, dependency-free project site for **AutoSafeHarness: Automatically
Securing Agents with Model- and Domain-Specific Safety Harnesses** (Li, Cao, Choi,
Suh, Xiao).

## Run locally

It's a static site — just serve the folder:

```bash
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` also works, but a local server is
recommended so the PDF link and fonts load cleanly.)

## What's here

| File | Purpose |
|------|---------|
| `index.html` | page structure & copy |
| `styles.css` | design system (palette keyed to the harness taxonomy) |
| `app.js`     | the interactive demo engine + results table + scroll animations |
| `assets/`    | `AutoSafeHarness_paper.pdf`, teaser figure, loop/shield icons (from the demo deck) |
| `Harness_demos.pptx` | the original demo slides this site is built from |

## The interactive demo

The centerpiece (`#demo`) is data-driven: every scenario lives in the
`SCENARIOS` array in `app.js`. Each harness component is a **node** with a
surface (`nl` / `code` / `judge` / `state`), a taxonomy section, and a detailed
description shown in the side panel on hover/tap. Three scenarios ship:

1. **Why per model?** — Sonnet 4.6 (lean) vs GLM-5 (hardened) on os-filesystem.
2. **Why per domain?** — finance, with the stateful wash-trading account book.
3. **Why per domain?** — telecom, with credential-egress redaction.

To add or edit a scenario, just extend `SCENARIOS`; the board, tabs, and detail
panel render automatically.

## Deploy

Any static host works (GitHub Pages, Netlify, S3, …). Push the `website/`
contents to the host's root. No build step.
