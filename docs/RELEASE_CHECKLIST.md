# Release Checklist — Republic of Ambazonia Archive

Every production deployment must pass every gate below before the commit is tagged
and pushed to `main`. No exceptions. Items in **bold** are blocking.

---

## Pre-build

- [ ] **`VITE_SITE_URL` is set** in the deployment environment (Vercel / CI env var) —
      empty string produces broken canonical URLs, JSON-LD, and citation exports.
- [ ] **`node scripts/generate-exports.js` exits 0** — confirms all PDFs are
      accessible and checksums computed. Check console output: document count must
      match expected total (currently 91).
- [ ] `src/data/build-info.json` is overwritten by the script (version ≠ `0.0.0` or
      gitCommit ≠ `unknown` if in a git repo).
- [ ] `public/exports/release.json` exists and `indexSha256` is a 64-character hex
      string.
- [ ] `public/health.json` exists and `documentCount` matches `documents.json`.

---

## Type-check & Build

- [ ] **`npx tsc -b` exits 0** — zero type errors.
- [ ] **`npx vite build` exits 0** — zero build errors.
- [ ] `dist/exports/release.json` is present in the build output (static asset copied
      from `public/exports/`).
- [ ] `dist/health.json` is present.

---

## Routing & Pages

- [ ] `/` — Home page loads.
- [ ] `/documents/archive` — Archive grid renders all documents.
- [ ] `/documents/{valid-id}` — Document page loads with PDF viewer, metadata panel,
      and citation boxes.
- [ ] `/documents/{invalid-slug}` — Renders institutional "Document Not Found" message
      with link to `/documents/archive`. Does **not** render the full archive grid.
- [ ] `/about/authority` — Loads; version stamp (`ROA v…`) visible at bottom.
- [ ] `/about/changelog` — Loads; version stamp visible at bottom.
- [ ] `/about/ledger` — Loads; all ledger entries rendered.
- [ ] `/404` — Renders institutional "Page Not Found" page.
- [ ] `/nonexistent-route` — Caught by `*` wildcard; renders same 404 page.
- [ ] `/documents/dinks-legacy-slug` — Redirected to corrected `dinka` form
      (CanonicalRedirect active).

---

## Environment Guardrail

- [ ] In a production build **with** `VITE_SITE_URL` set: no yellow warning banner on
      `/about/authority` or `/about/changelog`.
- [ ] In a production build **without** `VITE_SITE_URL`: gold-bordered warning banner
      is visible on both pages above.
- [ ] `EnvWarning` does **not** appear on any other page.

---

## Export Integrity

- [ ] `public/exports/roa-checksums.json` — every document ID has a non-empty SHA-256
      hash (no `""` values unless a PDF is genuinely absent).
- [ ] `public/exports/roa-index.json` — `docNumber` values follow `ROA-YYYY-XXXX`
      format; no duplicates.
- [ ] `public/exports/roa-index.csv` — opens cleanly in a spreadsheet; column count
      is 8; row count is document count + 1 (header).
- [ ] `sha256sum` (or equivalent) of `public/exports/roa-index.json` matches
      `indexSha256` field in `release.json`.

---

## SEO & Structured Data

- [ ] `<title>` tag updates on client-side navigation (spot-check two routes).
- [ ] `<link rel="canonical">` is present and correct on document pages.
- [ ] JSON-LD `CreativeWork` schema present on at least one document page
      (inspect DevTools → Elements → `<script type="application/ld+json">`).

---

## Post-deployment

- [ ] `https://{domain}/health.json` returns 200 with correct `documentCount`.
- [ ] `https://{domain}/exports/release.json` returns 200; `version` and `gitCommit`
      match the deployed commit.
- [ ] No 404s in browser console on the home page.
- [ ] Vercel deployment status: **Ready**.

---

_This checklist is authorised under Phase 10 — Governance, Versioning, Release Discipline._
