# Prozess-Check research on server1 (n8n)

The research run behind the Vorab-Fahrplan (spec `docs/superpowers/specs/2026-11-23-prozess-check-v2-vorab-fahrplan-design.md` §8, plan 2 Task 5). The website posts a `ResearchJob` (`src/lib/vorabFahrplan/job.ts`, never name, e-mail or phone) to n8n; n8n researches the visitor's programs and website with Claude, keeps a program library, and posts the result to `/api/prozess-check/deliver` (`ResearchResultSchema` in `src/lib/vorabFahrplan/research.ts`).

```
prompts/programm-recherche.md   one program → one pc_tools entry (call 1 research with web tools, call 2 extraction)
prompts/website.md              the visitor's website → plain-text findings (web_fetch only)
prompts/synthese.md             job + library + website → {pdf, dossier}
schemas/programm.output.json    output_config.format for programm-recherche
schemas/synthese.output.json    output_config.format for synthese
schemas/pc_tools.json           columns of the Data Tables pc_tools and pc_runs
workflows/                      exports of pc-research, pc-error, pc-sweep (Task 5), pc-seed (Task 6)
```

`src/lib/vorabFahrplan/schemaParity.test.ts` keeps the schemas in step with the zod contract and the table: change `ResearchResultSchema`, a schema or `pc_tools.json`, and `npx vitest run` says what drifted.

**Ajdin approved the prompts on 2026-11-24** (marker „Status: freigegeben von Ajdin am 24.11.2026“ at the top of each file). Paste them into the workflow from these files, never edit them only in n8n.

## Calling the Messages API from n8n

All Claude calls are HTTP Request nodes (the Anthropic Chat Model node breaks with 5.5 models on n8n 2.30.5).

- `POST https://api.anthropic.com/v1/messages`
- Headers: `x-api-key` from the credential „Anthropic prozess-check“, `anthropic-version: 2023-06-01` (plan 2 global constraint), `content-type: application/json`.
- Body: `model: "claude-sonnet-5-5"` (pinned), `max_tokens` as each prompt file says, `system`, `messages`, `tools`, `output_config`. No `temperature`/`top_p`/`top_k` (non-default values are a 400 on Sonnet 5.5), no `thinking` (Sonnet 5.5 runs adaptive thinking by default; `{"type": "disabled"}` is a 400).
- Server tools: `{"type": "web_search_20260209", "name": "web_search", "max_uses": N}` and `{"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": N}`. On web_fetch: `"max_content_tokens": 10000` (`caps.webFetchMaxContentTokens`), so one big page can't eat the run budget; the API accepts it on `web_fetch_20260209` (used in every test run, no 400).
- Structured output: `"output_config": {"format": {"type": "json_schema", "schema": <the file's JSON>}}`. The answer is the last `text` block of `content`; `JSON.parse` it.
- `stop_reason`:
  - `end_turn`: done.
  - `pause_turn`: the server-tool loop paused. **Append** `{"role": "assistant", "content": <response.content unchanged>}` to the message history and re-send. Never replace the earlier assistant turns: the tool result blocks in them carry the URLs for `erlaubteQuellen` and the facts call 2 extracts. Do not add a „continue“ message. At most 3 rounds, then treat as failed. Collect URLs and text blocks from **every** round's content. Every round sends the **same `tools` array (full `max_uses`) and the same `system`, byte for byte**: Sonnet 5.5 checks that `system`, `tools` and every earlier message are unchanged since a replayed block was produced (the paused content carries adaptive-thinking blocks) and answers 400 on any edit; dropping a tool with a pending `server_tool_use` is a 400 anyway. The per-program budget is enforced on the client: once either tool's count from `usage.server_tool_use` (summed over the rounds) reaches its cap, or the cost stop is reached, the loop ends and the research goes to the extraction with the notes so far. The website call runs the same loop.
  - `max_tokens` or `refusal`: the JSON may be incomplete or off-schema. Program research: store nothing, count the program as „nicht recherchiert“. Synthesis: post `{fallback: true, grund: "Synthese: <stop_reason>"}`.
  - Optional, beta: on a refusal the API can retry on another model by itself (`anthropic-beta: server-side-fallback-2026-07-01` header plus `"fallbacks": "default"` in the body). Not needed for the first runs; decide after measuring.
- Server-tool errors come back as HTTP 200 with an error object inside the result block (`web_search_tool_result.content` is then an object, not a list). Skip those when collecting URLs.

### Program research: two calls, then a URL check

Search results carry citations, and structured outputs reject citations with a 400 (claude-api skill, `shared/tool-use-concepts.md`, Structured Outputs: „Incompatible with: Citations“). So the default per program is two calls (detail in `prompts/programm-recherche.md`):

1. **Research:** web_search + web_fetch, no `output_config`, ends with notes. Handle `pause_turn` as above.
2. **Extraction:** no tools, `output_config.format` = `schemas/programm.output.json`, input = the notes of call 1 (`{{recherche_notizen}}`) and the URLs its result blocks returned (`{{gefundene_urls_json}}`).
3. **URL check before the upsert (Code node):** let `ok` = the set of URLs from call 1's `web_search_tool_result` / `web_fetch_tool_result` blocks, across all rounds. Remove every URL in `quellen`, `bordmittel[].quelle`, `api.doku` and `vendorUrl` that is not in `ok` (`api.doku` and `vendorUrl` become `""`). Drop every `bordmittel` entry whose `quelle` was removed. Only then upsert. Without this check a URL the model made up would sit in the library and count as a source in this run and every later one.

Optional, to try in Task 5: one call with tools and `output_config.format` together. If the API rejects it, stay with two calls. The URL check applies either way, against that one call's result blocks.

### Collecting `erlaubteQuellen`

The website shows a program claim only if every URL it cites is in `erlaubteQuellen` (spec §8.5). n8n builds that list itself, never from what the model says it read:

1. every `url` in the `content` list of each `web_search_tool_result` block, and the `url` of each `web_fetch_tool_result` result, from all research and website calls of this run;
2. for each library entry handed to the synthesis (fresh or from the library): `quellen`, every `bordmittel[].quelle`, `api.doku` and `vendorUrl`. These are safe to trust only because every entry passed the URL check above before it was stored.

Deduplicate, keep only `http(s)://` strings.

## Placeholders

Values go into the prompt text with plain string replacement. **Before inserting, remove every `<daten>` and `</daten>` (any case) from the value**, so visitor text cannot close the data block. JSON placeholders are `JSON.stringify(value, null, 2)`.

| Placeholder | Prompt | Value |
|---|---|---|
| `{{programm}}` | programm-recherche | One name from `job.programme`, as the visitor wrote it |
| `{{max_suchen}}` | programm-recherche | `caps.webSearchProProgramm` (4) |
| `{{max_abrufe}}` | programm-recherche | `caps.webFetchProProgramm` (3) |
| `{{schluss}}` | programm-recherche | The closing line for call 1 or call 2, both quoted in the prompt file |
| `{{recherche_notizen}}` | programm-recherche, call 2 | All text blocks of call 1, all rounds |
| `{{gefundene_urls_json}}` | programm-recherche, call 2 | URLs from call 1's result blocks, all rounds (the same set the URL check uses) |
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
- Upsert after the URL check (see „Program research“ above): the checked fields from `programm.output.json` (JSON fields stringified, see `pc_tools.json`), `key` from the visitor's spelling, the visitor's spelling added to `aliases`, `researchedAt` = now, `reviewed` = false. `gefunden: false` is stored too (negative cache).
- A failed or refused research call stores nothing, so the program is tried again next time.

## Caps and prices (one config object in pc-research)

```js
const config = {
  caps: {
    // Ajdin 2026-11-24 (Ruling X): one fresh program per lead, because a measured research call costs 0.55 to 0.80 USD.
    frischeProgrammeProLead: 1,
    webSearchProProgramm: 3,
    webFetchProProgramm: 3,
    webFetchMaxContentTokens: 10000, // per fetched page, research and website calls
    websiteFetches: 3,
    maxRundenPauseTurn: 3, // research and website calls; the extraction call has no tools
    runKostenStopUsd: 1.3, // Ajdin 2026-11-25 (Ruling X amended): was 1.0; with the estimates below a fresh program (0.85) plus the website (0.25) now fits
    libraryMaxAlterTage: 120,
  },
  // Budget guard: a program's research (call 1 + extraction) or the website call starts only if kostenUsd + its estimate <= runKostenStopUsd.
  schaetzungUsd: { recherche: 0.85, website: 0.25 }, // measured 2026-11-24, see „On server1“
  preise: {
    model: "claude-sonnet-5-5",
    tokenPreiseGeprueftAm: "2026-11-24", // claude-api skill model table
    inputUsdProMTok: 2.0,
    outputUsdProMTok: 10.0,
    cacheWrite5mUsdProMTok: 2.5,
    cacheReadUsdProMTok: 0.1,
    webSearchPreisGeprueftAm: "2026-11-23", // platform.claude.com/docs/en/about-claude/pricing
    webSearchUsdPro1000: 10.0,
    webFetchUsd: 0, // tokens only
  },
};
```

Cost of one call = `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens` from `usage` × their prices + `usage.server_tool_use.web_search_requests` × `webSearchUsdPro1000 / 1000`. Sum it after every call, the extraction call included (it adds roughly the notes plus the system prompt as input and the JSON as output, small next to the search results in call 1). Before each program's research and before the website call, the guard checks `kostenUsd + schaetzungUsd.<call> <= runKostenStopUsd`; if not, that call and everything after it is skipped (`capsGetroffen: ["kosten"]`) and the synthesis runs, which always runs. Paid research is kept: once a program's call 1 has run, its extraction (call 2, about 0.04 USD) runs too, even past the stop, and the checked entry is stored. The website side holds the daily cap (25 runs) and „fresh research once per e-mail per 30 days“ (`frischeRecherche` in the job). The monthly backstop is the spend limit of the Anthropic workspace „vrelo-vorab-fahrplan“: 30 USD/month, set by Ajdin 2026-11-24.

## Structured outputs: what was verified

Checked 2026-11-23 against the `claude-api` skill (`shared/tool-use-concepts.md`, „Structured Outputs“) and the live page platform.claude.com/docs/en/build-with-claude/structured-outputs:

- `output_config.format = {type: "json_schema", schema}` is the current parameter (`output_format` is deprecated). Supported on Claude Sonnet 5.5.
- Every object needs `additionalProperties: false`. Both schemas have it on every object; the parity test checks that.
- Supported: basic types, `enum` (strings only), `required`, `format` (`uri` is used for the PDF source URLs), `description`, array `minItems` of 0 or 1 only.
- Not supported (400 if present): `minLength`/`maxLength`, `minimum`/`maximum`, `maxItems` and any array constraint beyond `minItems` 0/1, `oneOf`, recursive schemas. So the character caps (titel 40, idee 260, mitProgrammen 180, tipp 180, programmZeile 160) and „exactly five questions“ live in the prompt text and the schema descriptions; the website cuts and checks lengths itself (`polish`, zod `.length(5)`).
- Limits per request: at most 24 optional properties and 16 union-type properties across all strict schemas. `synthese.output.json` has 3 optional properties (`mitProgrammen`, `tipp`, `website`), `programm.output.json` none, neither uses unions.
- Required properties come first in the output, optional ones after; enum values may differ in capitalisation (compare case-insensitively; our enums are lowercase ids and `S`/`M`/`L`).
- Incompatible with citations (400) and prefill. `stop_reason` `refusal` or `max_tokens` can return off-schema output.
- Web search results carry citations, so tools and `output_config.format` in one call are expected to fail. Program research therefore uses two calls by default; one call is only an optional experiment for Task 5.

## Credentials and config

| Name in n8n | Type | Holds |
|---|---|---|
| Anthropic prozess-check | Header Auth, header `x-api-key` | The key of the separate Anthropic workspace „vrelo-vorab-fahrplan“ (created by Ajdin 2026-11-23; spend limit 30 USD/month). On the laptop it sits in the HQ `.env` as `CLAUDE_VRELO_VORAB_FAHRPLAN`. Never the website's `ANTHROPIC_API_KEY`, never another HQ key. |
| Prozess-Check Secret | Header Auth, header `x-vrelo-secret` | The website's `PC_SHARED_SECRET`. Used twice: the pc-research webhook checks it, and the deliver POST sends it. |

No n8n Variables (licence-gated on self-hosted): the „Config“ Set node at the start of pc-research holds `deliverUrl` (= `PC_DELIVER_URL`, `https://vrelo-ki.de/api/prozess-check/deliver`), `model`, the caps and the prices. pc-error and pc-sweep each have a small „Config“ node with `deliverUrl` only: change the URL in all three. The website needs `N8N_PC_WEBHOOK_URL` (the pc-research production webhook URL) and the same `PC_SHARED_SECRET`.

## Deploy steps (server1)

1. Back up: Postgres dump + `/home/node/.n8n/config` as a pair (runbook „Backups“, `Knowledge/Tech/server1-n8n-host.md` in HQ). Never change the n8n image pin.
2. Create the Data Tables `pc_tools` and `pc_runs` with the columns in `schemas/pc_tools.json`. If Data Tables are missing on 2.30.5, two Postgres tables in `n8n-postgres` with the same columns; note it here.
3. Create both credentials above.
4. Import `workflows/pc-research.json`, `pc-error.json`, `pc-sweep.json`; attach the credentials; set pc-error as the error workflow of pc-research.
5. Workflow settings of pc-research: save failed executions only, keep successful ones off (spec §8.4). Pruning is instance-wide on server1, not per workflow: `EXECUTIONS_DATA_MAX_AGE=72` (hours) and `EXECUTIONS_DATA_PRUNE_MAX_COUNT=1000`, stricter than the 14 days of the spec, left as it is.
6. Paste the approved prompts from `prompts/` and the schemas from `schemas/` into their nodes.
7. Run the fixed test job (plan 2 Task 5 Step 5). Activate only after Ajdin's go, and then activate **pc-error and pc-sweep together with pc-research** (see below).
8. **Before the first production test, clear the test address in Upstash.** Preview and Production share one Upstash database, so the preview test runs (2026-11-25) left `ajdin@vrelo-ki.de` capped for 30 days: `pc:mail:<hash>` blocks the next send (the visitor sees success, nothing goes out) and `pc:fresh:<hash>` blocks fresh research. Delete exactly these two keys, nothing else:
   - `<hash>` = sha256 hex of `vrelo-pc-mail-v1:ajdin@vrelo-ki.de` (`PC_HASH_SALT` unset, so the default salt in `src/lib/vorabFahrplan/caps.ts`).
   - Send `["DEL", "pc:mail:<hash>"]` and `["DEL", "pc:fresh:<hash>"]` as JSON POST bodies to `UPSTASH_REDIS_REST_URL` with `Authorization: Bearer <UPSTASH_REDIS_REST_TOKEN>`, both from the HQ `.env`, from a script that reads the file and prints only the DEL results (the preview test used one, `clear-mail-cap.mjs`, in the session scratchpad). Never echo the URL or the token.
9. **Before go-live, re-export and diff** (see „Re-exporting the workflows“): the pc-* workflows get edited in the n8n UI, and the go-live state must be the committed one.

## On server1 (built 2026-11-24, plan 2 Task 5)

| What | Id |
|---|---|
| pc-research (webhook `POST https://server1.n8n-adz.de/webhook/prozess-check` = the website's `N8N_PC_WEBHOOK_URL`) | `rgrZAHzpkZe7BlWM` |
| pc-error (error workflow of pc-research) | `LHCwSm6lZ4RTJtIi` |
| pc-sweep | `bKNRGEJEeKPcCGuJ` |
| Data Table `pc_tools` / `pc_runs` | `T5APItQQ4m9hk0db` / `uufMxsjQ3EbiAu1g` |
| Credential „Anthropic prozess-check“ / „Prozess-Check Secret“ | `iaHm1R79EmeFcgmU` / `SCCkcZm64X10tM4I` |
| pc-seed (operator helper, inactive, plan 2 Task 6) | `9dKd5KiXE0QJRPjC` |

All three are inactive. The webhook answers `202 {"status":"accepted"}` at once (Webhook „Respond: Immediately“), a wrong `x-vrelo-secret` gets 403.

**Flow of pc-research:** Webhook → Config → „Lauf anlegen“ (pc_runs `running`, with the n8n execution id) → „Bibliothek lesen“ → „Plan“ (checks the job, matches keys and aliases, builds the queue and the step order) → loop „Nächstes Programm“ → „Recherche-Anfrage“ → „Claude Recherche“ → „Recherche auswerten“ → „Weiter?“ (pause_turn round / extraction / give up) → „Claude Extraktion“ → „URLs prüfen“ → „Bibliothek speichern“ (upsert by `key`) → back to „Nächstes Programm“; then the website loop „Website-Anfrage“ → „Claude Website“ → „Website auswerten“ → „Website weiter?“ → „Synthese vorbereiten“ → „Claude Synthese“ → „Synthese auswerten“ → „Ausliefern“ → „Lauf abschließen“. The budget guard sits in „Nächstes Programm“. Workflow timeout: 1500 s, so a run never outlives the sweep's 30 minutes. The run state travels in the item; each Code node reads the request that fed its HTTP call with `$('<node>').first()` (the last run of that node).

**Where the build differs from the sections above, and why:**

- **pc-error only runs while it is active.** n8n 2.30.5 logs „Workflow … is not active and cannot be executed“ for an inactive error workflow. At go-live activate pc-error and pc-sweep together with pc-research; until then error handling is off.
- **`pc_runs` has two extra columns.** `executionId`: the Error Trigger only knows the failed execution, not the job; pc-error finds the `jobId` through it. `aufrufe`: one entry per Messages call (`art`, tokens, searches, fetches, `usd`), for the console check and the cost numbers in the spec.
- **Deliver retry:** n8n's own retry waits 5 s at most, so „Ausliefern“ loops through a Wait node (60 s) and an IF on `$runIndex`: 1 try + 3 retries on 5xx and network errors, then „Stop and Error“, which hands over to pc-error. A 4xx is not retried: the row is set `failed` („Lauf fehlgeschlagen“) and the run stops. „Ausliefern“ does not follow redirects (the secret header stays on the deliver host).
- **pc-error and pc-sweep set a row `failed` only after the fallback POST got a 2xx.** Otherwise the row stays `running` and the next sweep tries again.
- **„Papier und Zettel“ is never researched**; it ends up under „nicht recherchiert“.
- **A stale library entry (older than 120 days, not reviewed) still goes to the synthesis** when the run does not research it again (cap or no `frischeRecherche`). A fresh research replaces it.
- **URL collection** walks the whole response for `web_search_result` and `web_fetch_result` objects, because the `_20260209` tools run dynamic filtering through code execution and return extra `code_execution_tool_result` blocks.
- **One call with tools and `output_config` was not tried** (Ruling S, test budget).
- **pc-sweep deletes by age, in two parallel branches off „Config“:** „Alte Läufe löschen“ (pc_runs, `startedAt` older than 30 days) and „Alte Programme löschen“ (pc_tools rows with `gefunden` = false and `researchedAt` older than 30 days, native Data Table node `deleteRows`). The second one backs the Datenschutz sentence that program names nobody could find are deleted after 30 days: negative-cache rows hold the visitor's free-text spelling. `researchedAt` is set on every upsert, so it is the last-update time (the system `updatedAt` also filters through the Data Table API, but the user column is what the other filters use). Found programs (`gefunden` = true) stay. The `gefunden` filter value is `={{ false }}` (a real boolean); the delete was checked by dry run through `n8n_manage_datatable` only, the node itself runs on the real schedule.
- **pc-sweep has a „Manuell testen“ trigger** besides the schedule. `n8n execute --id` on the box cannot run Data Table nodes („the module is disabled“), so the sweep was tested on its real schedule.
- Failed executions keep the webhook's request headers, the shared secret included. They live in our own n8n database and are pruned after 72 h.

**Cost, measured 2026-11-24.** Run 1 (old caps: 3 fresh programs, 4 searches, 20,000 tokens per page) read 341,847 input tokens in one research call 1 (dynamic filtering re-reads the results in every server-side step), cost 1.46 USD and went over the stop. Ajdin then decided one fresh program per lead (Ruling X) with the budget guard and the trims above. After that:

| Run | Programs | Calls (input / output tokens, searches, fetches, USD) | kostenUsd |
|---|---|---|---|
| A | Lexoffice (library), Outlook (fresh), website | research 152,529 / 6,726, 3, 2, 0.402 · extraction 7,285 / 2,613, 0.041 · website 106,328 / 2,460, 0, 3, 0.237 · synthesis 11,893 / 4,708, 0.071 | 0.751 |
| B | asdfqwer (fresh), no website | research 27,404 / 900, 1, 0, 0.074 · extraction 4,726 / 258, 0.012 · synthesis 7,205 / 2,326, 0.038 | 0.124 |

A run with only library programs costs the synthesis alone (about 0.04 to 0.07 USD). The tool versions stay `_20260209`: with the trims, the fresh Outlook research cost 0.44 USD with its extraction and run A stayed under the stop.

## Seeding pc_tools (operator route)

The chip programs are researched once before go-live, so a lead with only chip programs costs the synthesis alone. The route (built 2026-11-24, plan 2 Task 6):

- pc-research has a second trigger, „Seed (Operator)“ (Execute Workflow Trigger). Its settings allow one caller only: `callerPolicy: workflowsFromAList`, `callerIds` = pc-seed. It has no HTTP path of its own.
- **The seed flag counts only on that trigger.** „Plan“ reads the job from whichever trigger ran (`$('Webhook').isExecuted`), sets `seed = !vomWebhook` (the trigger is the only authority) and deletes any `seed` key from the job, so a `seed` key in the public webhook body changes nothing. `src/lib/vorabFahrplan/n8nSeed.test.ts` runs the exported Plan code to prove it and checks the wiring.
- A seed run is a normal research run with one program: the normal caps hold (1 fresh program, budget guard, 1.30 USD stop). When the queue is empty, „Seed?“ sends it to „Seed abschließen“ (pc_runs row: status `seed`, cost, `aufrufe`) instead of the website call, the synthesis and the deliver. The row starts as `seed`, never `running`, so pc-sweep never sends a fallback for it.
- pc-seed: Webhook `POST /webhook/prozess-check-seed` (header `x-vrelo-secret`, same credential, answers 202) → „Seed-Jobs“ (one job per program, random UUID jobId, `frischeRecherche: true`, no `seed` key) → Execute Workflow, once per item, waiting for each. It saves no executions, so the request headers are not kept.

To seed again (new chips, or after deleting rows):

1. n8n 2.x calls only published sub-workflows: pc-research must be active. Before go-live that briefly opens its public webhook too (still behind the secret). Activate pc-research, then pc-seed.
2. `POST https://server1.n8n-adz.de/webhook/prozess-check-seed` with `{"programme": ["Name 1", "Name 2"]}` (at most 6 per call: each run can overshoot its 1.30 USD stop, because the stop is checked between calls, so a small batch keeps one call well under the 10 USD seed ceiling) and the header `x-vrelo-secret` = `PC_SHARED_SECRET` from the HQ `.env`. Programs already in the library and fresh (or reviewed) are skipped.
3. Read the cost from `pc_runs` (status `seed`, `kostenUsd`, `aufrufe`), never from execution data. About 0.4 to 0.5 USD per program (2026-11-24).
4. Deactivate pc-seed, and pc-research too if it is not live yet.

## Reviewing pc_tools (Ajdin)

n8n → Overview → Data tables → `pc_tools`. Each row is one program. Open the row, check `bordmittel`, `api` and `grenzen` against the `quellen`, correct a cell if needed, then set `reviewed` to true. A reviewed entry is never re-researched and never overwritten by a run. To force a fresh research: set `reviewed` to false and `researchedAt` to a date more than 120 days ago, or delete the row. The chip programs (`PROGRAMM_CHIPS` in `src/lib/prozessCheck.ts`) are researched and reviewed before go-live (plan 2 Task 6).

## Re-exporting the workflows

**Re-export and diff before every commit that touches `n8n/` and before go-live.** The pc-* workflows can be (and are) edited in the n8n UI; a UI save also moves nodes and drops parameters that equal their defaults. From the repo root:

```bash
node n8n/prozess-check/export-workflows.mjs   # pc-research, pc-error, pc-sweep, pc-seed → workflows/
git diff --stat n8n/prozess-check/workflows/
```

The script reads the n8n API key from the `n8n-mcp` entry in `~/.claude.json` and never prints it; it writes credentials as `{id, name}`, no pinData, `"active": false`, and refuses an active workflow or any file holding a secret-like string. Read the diff before committing: positions and dropped defaults are harmless (check a dropped parameter against `get_node` when in doubt), any other change was made in the UI and must be understood first. This is how `2ef4738` was produced.


After any change in the n8n UI, export all three (and pc-seed, if it changed) back into `workflows/` and commit, so this folder stays the source of truth:

- UI: open the workflow → ⋯ → Download, save as `workflows/<name>.json`; or
- on server1: `docker exec <n8n container> n8n export:workflow --id=<id> --output=/tmp/<name>.json --pretty`, then copy it out.

**Copies to keep in step.** The builder copies the prompt texts and both schemas (`const P`, `SCHEMA_PROGRAMM`, `SCHEMA_SYNTHESE` at the top of the code) into five Code nodes of pc-research: „Nächstes Programm“, „Recherche-Anfrage“, „Recherche auswerten“, „Website-Anfrage“, „Synthese vorbereiten“. A prompt or schema change edits all five copies, from the files in `prompts/` and `schemas/`. `deliverUrl` sits in the „Config“ node of all three workflows: pc-research, pc-error, pc-sweep.

Before committing, check the file holds no secrets: credentials appear only as `{id, name}` references, no `pinData` with visitor answers (delete `pinData` if present), no webhook URLs with tokens in them. Keep the workflows inactive in the export (`"active": false`).
