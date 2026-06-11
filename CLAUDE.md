# Velora docs — agent instructions

Canonical instructions for AI coding agents working in this repo. `AGENTS.md` points here; if you read that file first, this is the real content.

## What this repo is

- The Velora documentation site, built on [Mintlify](https://mintlify.com). Pages are MDX files with YAML frontmatter; navigation lives in `docs.json`.
- The site is **pre-production**. Renames and moves need no redirects or backward-compat shims yet.
- **Deployment.** The canonical production root is `https://velora.xyz/docs` — use it for any absolute self-links (e.g. the agent prompt libraries). Today the docs are **only deployed to staging** at `https://new-docs.velora.xyz/docs`; the `velora.xyz/docs` root is not live yet, so links there will 404 until the production cutover.

## Commands

- `pnpm run dev` — local preview.
- `pnpm run check` — run before every PR. Runs `check:links` (`mint broken-links --check-anchors --check-snippets`) then `check:build` (`mint validate`).

## Write for humans first, then for search and answer engines

Every page serves three readers: a human integrator, a search engine, and an answer engine (LLMs quoting the docs). Human readability wins every tie, and a page that reads well usually ranks well.

- **Frontmatter is the search snippet.** Every page gets a `description` — one concrete sentence containing the page's main term — and a `keywords` array of phrases integrators actually search for ("gasless swap", "DEX aggregator API", "limit order API").
- **Lead with the answer.** The opening paragraph answers the question implied by the title and works when quoted standalone. That paragraph is what answer engines extract.
- **Search terms belong in prose, naturally.** Use the vocabulary integrators search with, where it genuinely fits. Never stuff keywords; a sentence that exists only for ranking gets cut.
- **Headings are search results.** Sentence case, specific enough to stand alone. Product names keep Title Case inside them: Swaps, Limit Orders, TWAP, OTC, Crosschain, Delta, Market.
- **No SEO scaffolding.** No generic FAQ blocks, "machine-readable summary" sections, or AEO boilerplate unless they answer real reader questions.

## Humanize your prose (required)

The docs must not read AI-generated.

- If you have a humanizer skill, run it over any prose you write or substantially edit. In Claude Code this is `/humanizer`.
- If you don't have one, tell the user and suggest installing one (the one used here is [blader/humanizer](https://github.com/blader/humanizer)). Until then, apply these conventions manually:
  - Thin prose em dashes; vary the substitute (colon, semicolon, comma, sentence break). Keep `` `term` — definition `` dashes in glossary and event lists.
  - Don't write bold-header bullets (`- **Label:** text`) for what is really prose; keep them only for genuine glossaries.
  - Bold only does real work: defined terms on first use, contrastive pairs, hard warnings. Not product names, numbers, or emphasis.
  - No rule-of-three scaffolds, tailing negations ("— no gas, no signup"), or identical fixes repeated across files.
- Exemption: `for-agents/` pages keep their listy, deterministic format. It is deliberate, for machine consumption.

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
| Crosschain (the product name, as in Crosschain Delta; lowercase crosschain as an adjective) | cross-chain, multichain, bridge swaps |
| solver | filler, executor |

## Semantic locks

The expensive mistakes. These facts must survive every edit.

- `/quote` uses `chainId`, not `network`. `mode` is `DELTA`, `MARKET`, or `ALL`.
- `mode=ALL` returns **one** response shape — top-level `delta` or top-level `market`, never both. Integrations branch on response shape, never on assumptions from the original request.
- MEV-protection intent routes to Delta only: `mode=DELTA`.
- Limit Orders are Delta orders (signed intents, target-price constraints, delayed settlement) — never AugustusRFQ.
- TWAP is one scheduled Delta order, not repeated swaps. Sell TWAP fixes total source amount; buy TWAP fixes total destination amount and caps source spend.
- OTC/RFQ settlement maps to AugustusRFQ.
- Native token placeholder, exactly: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`.
- Delta payloads stay opaque: preserve `delta` and its matching `hmac`, never reconstruct.
- Always highlight Delta first, over Market. In any mixed surface (prose, lists, card groups, tables, headings, examples), Delta comes before Market.
- "10+ EVM chains", never "every EVM chain".

## Structure and content rules

- **Failure-mode standard for API reference pages**: every endpoint in `/api-reference/` has a failure-mode table (5–8 rows: symptom → root cause → fix) stored as an MDX snippet under `/snippets/failure-modes/<endpoint-slug>.mdx`. Endpoint pages use `openapi: "<spec-path> METHOD /path"` frontmatter with no inline MDX body; all snippets are aggregated on `api-reference/troubleshooting.mdx` under per-endpoint H3s. New endpoint → add the snippet file and import it there; never duplicate the table on the endpoint page.
- **Snippet editing is git/CLI only.** Mintlify's web editor cannot save snippet files. Edit `snippets/failure-modes/<endpoint>.mdx` in the repo and push.
- **Contract addresses live in exactly one place**: `/resources/chains-and-contracts`. Other pages link there. Exception: failure-mode rows may inline an address when the address is the diagnostic itself (e.g. "Delta contract must be the spender" → cite `0x...933C96D`); document the exception on the page when first used.
- **API host policy**: code examples and `openapi:` `servers` blocks use `https://api.velora.xyz`. The legacy hosts `api.paraswap.io` and `apiv5.paraswap.io` appear only in the apiv5 migration page, and only as the *source* of the migration.
- **Partner key in code examples**: every quote/swap example includes `partner=my-app-name` (cURL) / `partner: 'my-app-name'` (SDK). `my-app-name` is a placeholder integrators replace with their own app/project partner identifier — never a production value. On first-touch entry pages (Quickstart, API reference introduction), add a short adjacent note saying so. `partner` is a free, no-signup attribution string, not a secret API key.
- **`developers.velora.xyz` is deprecated.** It is being migrated to Mintlify; canonical developer docs will live under `velora.xyz/docs` (currently staged at `new-docs.velora.xyz/docs`). Don't link to it from new content or write it into source-of-truth fields (`_meta.sources`, `externalDocs.url`). When pulling data from it, copy the data into the repo as the new source of truth.
- Don't document internal admin features, off-chain Portikus operator dashboards, or private partner endpoints.

## Style

- Active voice, second person ("you"). One idea per sentence.
- Sentence case for headings (product names keep Title Case — see above).
- Bold for UI elements: Click **Settings**.
- Code formatting for file names, commands, paths, contract addresses, and code references.
