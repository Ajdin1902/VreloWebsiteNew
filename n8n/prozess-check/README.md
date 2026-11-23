# Prozess-Check research on server1 (n8n)

The research run behind the Vorab-Fahrplan (spec `docs/superpowers/specs/2026-11-23-prozess-check-v2-vorab-fahrplan-design.md` §8, plan 2 Task 5). The website posts a `ResearchJob` (`src/lib/vorabFahrplan/job.ts`, never name, e-mail or phone) to n8n; n8n researches the visitor's programs and website with Claude, keeps a program library, and posts the result to `/api/prozess-check/deliver` (`ResearchResultSchema` in `src/lib/vorabFahrplan/research.ts`).

```
prompts/programm-recherche.md   one program → one pc_tools entry (web_search + web_fetch)
prompts/website.md              the visitor's website → plain-text findings (web_fetch only)
prompts/synthese.md             job + library + website → {pdf, dossier}
schemas/programm.output.json    output_config.format for programm-recherche
schemas/synthese.output.json    output_config.format for synthese
schemas/pc_tools.json           columns of the Data Tables pc_tools and pc_runs
workflows/                      exports of pc-research, pc-error, pc-sweep (Task 5)
```

`src/lib/vorabFahrplan/schemaParity.test.ts` keeps the schemas in step with the zod contract and the table: change `ResearchResultSchema`, a schema or `pc_tools.json`, and `npx vitest run` says what drifted.

**The prompts are drafts until Ajdin approves them** (marker „Status: Entwurf, Ajdin gibt frei“ at the top of each file). Paste them into the workflow from these files, never edit them only in n8n.

## Calling the Messages API from n8n

All Claude calls are HTTP Request nodes (the Anthropic Chat Model node breaks with 5.5 models on n8n 2.30.5).

- `POST https://api.anthropic.com/v1/messages`
- Headers: `x-api-key` from the credential „Anthropic prozess-check“, `anthropic-version: 2023-06-01` (plan 2 global constraint), `content-type: application/json`.
- Body: `model: "claude-sonnet-5-5"` (pinned), `max_tokens` as each prompt file says, `system`, `messages`, `tools`, `output_config`. No `temperature`/`top_p`/`top_k` (non-default values are a 400 on Sonnet 5.5), no `thinking` (Sonnet 5.5 runs adaptive thinking by default; `{"type": "disabled"}` is a 400).
- Server tools: `{"type": "web_search_20260209", "name": "web_search", "max_uses": N}` and `{"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": N}`. Recommended on web_fetch: `"max_content_tokens": 20000`, so one big page can't eat the run budget.
- Structured output: `"output_config": {"format": {"type": "json_schema", "schema": <the file's JSON>}}`. The answer is the last `text` block of `content`; `JSON.parse` it.
- `stop_reason`:
  - `end_turn`: done.
  - `pause_turn`: the server-tool loop paused. Re-send the same request with `messages = [<the original user message>, {"role": "assistant", "content": <response.content unchanged>}]`. Do not add a „continue“ message. At most 3 rounds, then treat as failed.
  - `max_tokens` or `refusal`: the JSON may be incomplete or off-schema. Program research: store nothing, count the program as „nicht recherchiert“. Synthesis: post `{fallback: true, grund: "Synthese: <stop_reason>"}`.
  - Optional, beta: on a refusal the API can retry on another model by itself (`anthropic-beta: server-side-fallback-2026-07-01` header plus `"fallbacks": "default"` in the body). Not needed for the first runs; decide after measuring.
- Server-tool errors come back as HTTP 200 with an error object inside the result block (`web_search_tool_result.content` is then an object, not a list). Skip those when collecting URLs.

### Collecting `erlaubteQuellen`

The website shows a program claim only if every URL it cites is in `erlaubteQuellen` (spec §8.5). n8n builds that list itself, never from what the model says it read:

1. every `url` in the `content` list of each `web_search_tool_result` block, and the `url` of each `web_fetch_tool_result` result, from all research and website calls of this run;
2. for each library entry handed to the synthesis (fresh or from the library): `quellen`, every `bordmittel[].quelle`, `api.doku` and `vendorUrl`.

Deduplicate, keep only `http(s)://` strings.

## Placeholders

Values go into the prompt text with plain string replacement. **Before inserting, remove every `<daten>` and `</daten>` (any case) from the value**, so visitor text cannot close the data block. JSON placeholders are `JSON.stringify(value, null, 2)`.

| Placeholder | Prompt | Value |
|---|---|---|
| `{{programm}}` | programm-recherche | One name from `job.programme`, as the visitor wrote it |
| `{{max_suchen}}` | programm-recherche | `caps.webSearchProProgramm` (4) |
| `{{max_abrufe}}` | programm-recherche | `caps.webFetchProProgramm` (3) |
| `{{recherche_notizen}}` | programm-recherche, two-call variant only | Text blocks of the first call |
| `{{gefundene_urls_json}}` | programm-recherche, two-call variant only | URLs from the first call's result blocks |
| `{{website_url}}` | website | `job.website` |
| `{{max_website_abrufe}}` | website | `caps.websiteFetches` (3) |
| `{{heute}}` | synthese | Today, `TT.MM.JJJJ`, Europe/Berlin |
| `{{reihenfolge_json}}` | synthese | See below |
| `{{job_json}}` | synthese | The job without `jobId`, `createdAt`, `frischeRecherche` |
| `{{library_entries_json}}` | synthese | Library entries for the visitor's programs with `gefunden` true or false, JSON columns parsed, plus `programm` = the visitor's spelling. Drop `key`, `reviewed`, `researchedAt`. |
| `{{nicht_recherchiert_json}}` | synthese | Names from `job.programme` without a library entry (cap hit, call failed) |
| `{{website_findings}}` | synthese | Output of the website call, else `keine Website angegeben`; on failure `Website nicht lesbar` |

`{{reihenfolge_json}}` is the website's `schrittOrder` (`src/lib/vorabFahrplan/fallback.ts`), computed the same way in a Code node, because `mergeResearch` matches steps by `bereich` and ignores any other:

```js
const AREA_IDS = ["anfragen", "angebote", "auftraege", "rechnungen", "postfach", "daten", "erinnern", "orga"];
const h = (id) => job.stunden[id] || 0;
const rest = AREA_IDS.filter((id) => job.bereiche.includes(id) && id !== job.nervt && h(id) > 0)
  .sort((x, y) => h(y) - h(x)); // stable sort keeps AREA_IDS order on ties
const reihenfolge = [job.nervt, ...rest].slice(0, 3)
  .map((bereich, i) => ({ rang: ["Zuerst", "Danach", "Später"][i], bereich }));
```

## After the synthesis call

1. `JSON.parse` the output → `{pdf, dossier}`.
2. `dossier.kostenUsd` = the run cost so far including this call; `dossier.capsGetroffen` = the caps hit (e.g. `["programme"]`, `["kosten"]`). These two are not in `synthese.output.json`: the model can't know them.
3. `dossier.fragen`: structured outputs can't enforce „exactly five“ (see below). More than five: keep the first five. Fewer: leave it; the website then drops the dossier part only and says so in the dossier mail, the PDF still goes out.
4. POST to `PC_DELIVER_URL` with header `x-vrelo-secret`: `{jobId, fallback: false, erlaubteQuellen, pdf, dossier}`. Retry 3 times, 60 s apart.

## pc_tools: lookup and upsert

- `key` = `name.trim().toLowerCase().replace(/\s+/g, " ")`. Lookup matches `key` or any entry of `aliases` normalised the same way.
- An entry counts as unknown when it is missing, or older than 120 days (`researchedAt`) and `reviewed` is false.
- Upsert after a research call: the model's fields from `programm.output.json` (JSON fields stringified, see `pc_tools.json`), `key` from the visitor's spelling, the visitor's spelling added to `aliases`, `researchedAt` = now, `reviewed` = false. `gefunden: false` is stored too (negative cache).
- A failed or refused research call stores nothing, so the program is tried again next time.

## Caps and prices (one config object in pc-research)

```js
const config = {
  caps: {
    frischeProgrammeProLead: 3,
    webSearchProProgramm: 4,
    webFetchProProgramm: 3,
    websiteFetches: 3,
    maxRundenPauseTurn: 3,
    runKostenStopUsd: 1.0,
    libraryMaxAlterTage: 120,
  },
  // Checked 2026-11-23 on platform.claude.com/docs/en/about-claude/pricing. Re-check when the model changes.
  preise: {
    geprueftAm: "2026-11-23",
    model: "claude-sonnet-5-5",
    inputUsdProMTok: 2.0,
    outputUsdProMTok: 10.0,
    cacheWrite5mUsdProMTok: 2.5,
    cacheReadUsdProMTok: 0.1,
    webSearchUsdPro1000: 10.0,
    webFetchUsd: 0, // tokens only
  },
};
```

Cost of one call = `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens` from `usage` × their prices + `usage.server_tool_use.web_search_requests` × `webSearchUsdPro1000 / 1000`. Sum it after every call; at ≥ `runKostenStopUsd` skip the remaining research and go to the synthesis. The website side holds the daily cap (25 runs) and „fresh research once per e-mail per 30 days“ (`frischeRecherche` in the job). The monthly limit is the Anthropic workspace spend limit ($20), the backstop.

## Structured outputs: what was verified

Checked 2026-11-23 against the `claude-api` skill (`shared/tool-use-concepts.md`, „Structured Outputs“) and the live page platform.claude.com/docs/en/build-with-claude/structured-outputs:

- `output_config.format = {type: "json_schema", schema}` is the current parameter (`output_format` is deprecated). Supported on Claude Sonnet 5.5.
- Every object needs `additionalProperties: false`. Both schemas have it on every object; the parity test checks that.
- Supported: basic types, `enum` (strings only), `required`, `format` (`uri` is used for the PDF source URLs), `description`, array `minItems` of 0 or 1 only.
- Not supported (400 if present): `minLength`/`maxLength`, `minimum`/`maximum`, `maxItems` and any array constraint beyond `minItems` 0/1, `oneOf`, recursive schemas. So the character caps (titel 40, idee 260, mitProgrammen 180, tipp 180, programmZeile 160) and „exactly five questions“ live in the prompt text and the schema descriptions; the website cuts and checks lengths itself (`polish`, zod `.length(5)`).
- Limits per request: at most 24 optional properties and 16 union-type properties across all strict schemas. `synthese.output.json` has 3 optional properties (`mitProgrammen`, `tipp`, `website`), `programm.output.json` none, neither uses unions.
- Required properties come first in the output, optional ones after; enum values may differ in capitalisation (compare case-insensitively; our enums are lowercase ids and `S`/`M`/`L`).
- Incompatible with citations (400) and prefill. `stop_reason` `refusal` or `max_tokens` can return off-schema output.
- **Not verified:** structured output combined with the web_search/web_fetch server tools in one call. The docs say the grammar applies only to Claude's direct output, not to tool calls or results, which suggests it works, but no example shows it. Task 5 tests it on the first program; if it is rejected, use the two-call variant in `programm-recherche.md`.

## Credentials and config

| Name in n8n | Type | Holds |
|---|---|---|
| Anthropic prozess-check | Header Auth, header `x-api-key` | The key of the separate Anthropic workspace „prozess-check“ ($20/month limit). On the laptop it sits in the HQ `.env` as `CLAUDE_VRELO_VORAB_FAHRPLAN`. Never the website's `ANTHROPIC_API_KEY`, never another HQ key. |
| Prozess-Check Secret | Header Auth, header `x-vrelo-secret` | The website's `PC_SHARED_SECRET`. Used twice: the pc-research webhook checks it, and the deliver POST sends it. |

n8n variables (or the config node): `PC_DELIVER_URL` (`https://vrelo-ki.de/api/prozess-check/deliver`, a preview URL while testing), plus the caps and prices above. The website needs `N8N_PC_WEBHOOK_URL` (the pc-research production webhook URL) and the same `PC_SHARED_SECRET`.

## Deploy steps (server1)

1. Back up: Postgres dump + `/home/node/.n8n/config` as a pair (runbook „Backups“, `Knowledge/Tech/server1-n8n-host.md` in HQ). Never change the n8n image pin.
2. Create the Data Tables `pc_tools` and `pc_runs` with the columns in `schemas/pc_tools.json`. If Data Tables are missing on 2.30.5, two Postgres tables in `n8n-postgres` with the same columns; note it here.
3. Create both credentials above.
4. Import `workflows/pc-research.json`, `pc-error.json`, `pc-sweep.json`; attach the credentials; set pc-error as the error workflow of pc-research.
5. Workflow settings of pc-research: save failed executions only, keep successful ones off, prune after 14 days (spec §8.4).
6. Paste the approved prompts from `prompts/` and the schemas from `schemas/` into their nodes.
7. Run the fixed test job (plan 2 Task 5 Step 5). Activate only after Ajdin's go.

## Reviewing pc_tools (Ajdin)

n8n → Overview → Data tables → `pc_tools`. Each row is one program. Open the row, check `bordmittel`, `api` and `grenzen` against the `quellen`, correct a cell if needed, then set `reviewed` to true. A reviewed entry is never re-researched and never overwritten by a run. To force a fresh research: set `reviewed` to false and `researchedAt` to a date more than 120 days ago, or delete the row. The chip programs (`PROGRAMM_CHIPS` in `src/lib/prozessCheck.ts`) are researched and reviewed before go-live (plan 2 Task 6).

## Re-exporting the workflows

After any change in the n8n UI, export all three back into `workflows/` and commit, so this folder stays the source of truth:

- UI: open the workflow → ⋯ → Download, save as `workflows/<name>.json`; or
- on server1: `docker exec <n8n container> n8n export:workflow --id=<id> --output=/tmp/<name>.json --pretty`, then copy it out.

Before committing, check the file holds no secrets: credentials appear only as `{id, name}` references, no `pinData` with visitor answers (delete `pinData` if present), no webhook URLs with tokens in them. Keep the workflows inactive in the export (`"active": false`).
