# Branch Strategy

## Branch Map

| Branch         | Purpose                                                                 |
|----------------|-------------------------------------------------------------------------|
| `main`         | Production-ready. Protected. Deployments trigger from this branch only. |
| `dev`          | Integration branch. Features merge here before any release.             |
| `phase5/*`     | Phase-scoped feature branches (e.g. `phase5/citation-system`).          |
| `release/*`    | Release staging (e.g. `release/1.2.0`). Cut from `dev`.                |

## Merge Rules

- **`main`** — Accepts merges only from `release/*` branches or emergency hotfixes.
  CI must be green. Requires at least one reviewer approval. No direct commits.
- **`dev`** — Accepts merges from `phase*/*` feature branches via PR. CI must pass.
- **Feature branches** — Branch off `dev`. PR back to `dev`. Keep scope small and focused.
- **Releases** — Cut `release/x.y.z` from `dev`. Final QA on the release branch.
  Merge into `main` and tag: `git tag vX.Y.Z`. Never merge release back to dev.
- **Hotfixes** — Branch off `main` as `hotfix/description`. Merge into both `main` and `dev`.

## Housekeeping

- Delete merged branches promptly after PR closes.
- Do not rebase or force-push `main` or `dev`.
- Every commit to `main` must be reachable from a tagged release.
