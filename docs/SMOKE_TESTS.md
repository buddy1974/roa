# Smoke Tests — Republic of Ambazonia Archive

A minimal set of explicit URL checks to run against any deployment before
considering it stable. Replace `{BASE}` with the deployment origin
(e.g. `https://roa.vercel.app`).

---

## Static Asset Endpoints

| URL | Expected |
|-----|----------|
| `{BASE}/health.json` | 200 — JSON with `version`, `builtAtUTC`, `commit`, `documentCount` |
| `{BASE}/exports/release.json` | 200 — JSON with `version`, `gitCommit`, `builtAtUTC`, `documentCount`, `indexSha256` |
| `{BASE}/exports/roa-index.json` | 200 — JSON array, length = `documentCount` |
| `{BASE}/exports/roa-index.csv` | 200 — CSV, first line = `docNumber,id,title,year,category,canonicalUrl,pdfPath,sha256` |
| `{BASE}/exports/roa-checksums.json` | 200 — JSON object, all values are 64-char hex strings |

---

## SPA Routes (all return 200 with HTML — SPA rewrite active)

| URL | Expected page content |
|-----|-----------------------|
| `{BASE}/` | Home page |
| `{BASE}/documents` | Document landing page |
| `{BASE}/documents/archive` | Document archive grid |
| `{BASE}/documents/constitution_of_the_federal_republic_of_ambazonia` | Document page (PDF viewer + metadata) |
| `{BASE}/documents/nonexistent-slug-xyz` | "Document Not Found" institutional message + link to archive |
| `{BASE}/about/authority` | Authority & Citation Policy page; version stamp at bottom |
| `{BASE}/about/changelog` | System Changelog page; version stamp at bottom |
| `{BASE}/about/ledger` | Document Change Ledger; all seed entries rendered |
| `{BASE}/404` | "Page Not Found" institutional page |
| `{BASE}/completely-unknown-path` | "Page Not Found" institutional page (wildcard catch) |
| `{BASE}/index` | Constitutional Index |
| `{BASE}/research/inquiry` | Research & Inquiry |
| `{BASE}/history` | History landing |
| `{BASE}/governance` | Governance landing |

---

## Canonical Redirect Checks

| Request URL | Expected redirect target |
|-------------|--------------------------|
| `{BASE}/documents/UPPERCASE-PATH` | Lowercased equivalent |
| `{BASE}/documents/path//double-slash` | Normalised single-slash form |
| `{BASE}/documents/{any-id-containing-dinks}` | Same path with `dinks` → `dinka` |

---

## Environment Guardrail Check

Run these checks against a production build **without** `VITE_SITE_URL`:

| URL | Expected |
|-----|----------|
| `{BASE}/about/authority` | Gold-bordered warning banner visible |
| `{BASE}/about/changelog` | Gold-bordered warning banner visible |
| `{BASE}/` | No warning banner |
| `{BASE}/documents/archive` | No warning banner |

---

## Document Integrity Spot-check

1. Open `{BASE}/exports/roa-checksums.json`.
2. Copy the SHA-256 value for any document ID.
3. Download the corresponding PDF from `{BASE}/documents/{filename}`.
4. Compute `sha256sum` of the downloaded file locally.
5. Confirm the computed hash matches the value in `roa-checksums.json`.

---

_These tests are authorised under Phase 11 — Environment Hardening & Institutional Polish._
