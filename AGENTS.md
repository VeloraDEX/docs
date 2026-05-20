# Documentation project instructions

## About this project

- This is the Velora documentation site built on [Mintlify](https://mintlify.com).
- Pages are MDX files with YAML frontmatter.
- Configuration lives in `docs.json`.
- Run `pnpm run dev` (alias for `mint dev`) to preview locally.
- Run `pnpm run check` before opening a PR. It runs two guards:
  - `pnpm run check:links` — `mint broken-links --check-anchors --check-snippets`.
  - `pnpm run check:build` — `mint validate` (strict mode).

## Terminology

Use these terms consistently across all docs:

| Use | Don't use |
|---|---|
| Velora | ParaSwap (legacy; only when referring to historical context) |
| VLR | PSP (legacy; only when discussing the migration) |
| Market API | aggregator API, v5/v6 API |
| Delta | "the Delta API" in marketing prose (the product noun is just "Delta"). In API-reference titles only, "Delta API" is allowed as the API-surface name parallel to "Market API". |
| AugustusRFQ | RFQ contract, OTC contract |
| Augustus v6.2 | Augustus router, AugustusSwapper |
| Portikus | the Delta solver network, the intent solver network |
| gasless | gas-less, gas-free |
| crosschain | cross-chain |
| solver | filler, executor |

## Style preferences

- Use active voice and second person ("you").
- Keep sentences concise — one idea per sentence.
- Use sentence case for headings.
- Bold for UI elements: Click **Settings**.
- Code formatting for file names, commands, paths, contract addresses, and code references.
- **Failure-mode standard for API reference pages**: every endpoint in `/api-reference/` has a failure-mode table (5–8 rows: symptom → root cause → fix) stored as an MDX snippet under `/snippets/failure-modes/<endpoint-slug>.mdx`. Snippets are **not** rendered on the endpoint pages themselves — endpoint pages use `openapi: "<spec-path> METHOD /path"` frontmatter and let Mintlify render params + response + "Try it" from the OpenAPI spec, with no inline MDX body. All snippets are aggregated on the single consolidated page `api-reference/troubleshooting.mdx`, imported once and rendered under per-endpoint H3s grouped by API. When you add a new endpoint, add the snippet file and import it in `api-reference/troubleshooting.mdx`; do not duplicate the table on the endpoint page.
- **Snippet editing is git/CLI only.** Mintlify's web editor does not support snippet files. To edit a failure-mode table, clone the repo and edit `snippets/failure-modes/<endpoint>.mdx` directly, then push or open a PR. The Mintlify dashboard cannot save changes to snippet files.

## Content boundaries

- Don't document internal admin features, off-chain Portikus operator dashboards, or private partner endpoints.
- **API host policy**: code examples and the `openapi:` `servers` block use `https://api.velora.xyz` — the production endpoint. The legacy hosts `api.paraswap.io` and `apiv5.paraswap.io` are deprecated; they should only appear in the apiv5 → current-host migration page (and in that page only as the *source* of the migration, never the *destination*). The `npm run check:host` script enforces this; if you legitimately need to mention a legacy host in a new page, add it to the allowlist in `scripts/check-api-host.sh`.
- **Partner key in code examples**: every quote/swap example should include `partner=my-app-name` (cURL) / `partner: 'my-app-name'` (SDK) so integrators copy it. The literal `my-app-name` is the placeholder users replace with their own partner-key string.
- Contract addresses live in exactly one place: `/resources/chains-and-contracts`. Other pages link there, never inline-duplicate. **Exception**: failure-mode-row tables may inline a specific deployed address when the address is the actual diagnostic (e.g. "Delta contract must be the spender" → cite `0x...933C96D` inline). Document this exception on the same page when first used.
