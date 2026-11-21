# Incident 2026-11-21: `next dev` spawned ~2,000 PostCSS workers and crashed the laptop

**Status:** fixed by `experimental.turbopackFileSystemCacheForDev: false` in `next.config.ts` (see *Recurrence* below). Moving the stale cache out was not enough: a fresh cache went bad again within the hour. Why Turbopack poisons its own cache: unknown (upstream bug, Next 16.2.7).

## Recurrence 13:53 + 13:56 (fresh cache) and the real fix

- Two more hard freezes (Kernel-Power 41, BugcheckCode 0, power button) at 13:53 and 13:56, with the same OOM cascade first (`chrome.exe`, `dwm.exe` at 13:54). The dev log ended at `○ Compiling / ...`.
- The cache was created at 13:09 and tested healthy then. By 13:51 it was poisoned. The only visible trace: Turbopack had renamed the PostCSS library chunk (`node_modules_20v-8wl._.js` → `1-4i_20v-8wl._.js`, byte-identical apart from the name), so the bad state lives in the persisted task cache.
- Guarded repro (1 s watchdog, cap +30 node processes):

| Run | Result |
|---|---|
| Poisoned 13:09 cache, default config | 3 processes until the first request, then **59 within 2 s** → killed |
| No cache, default config | 4 processes, flat for 60 s, `/` in 4.5 s |
| **Same poisoned cache, `turbopackFileSystemCacheForDev: false`** | 4 processes, flat for 45 s, `/` in 3.0 s; a second restart is flat too |

- Ruled out: Node (25.9.0 since 2026-03), `next`/Tailwind packages (unchanged since 08/2026), Windows updates (last 2026-11-11), large non-ignored files in the repo.
- Not an option here: `experimental.turbopackPluginRuntimeStrategy: 'workerThreads'` needs Next ≥ 16.4 and falls back to child processes on Node ≥ 24.13.1.
- Cost of the fix: every `next dev` start compiles from scratch (a few seconds). Undo it once an upgraded Next survives the repro below with the flag removed.
- ☐ Delete the poisoned evidence copy and `C:\Users\ajdin\next-cache-bak-20261121` once the dev server has run fine for a day.

## Symptom

The laptop (32 GB RAM, Intel Arc) froze repeatedly from 12:29 and died hard at 12:44 (Kernel-Power 41, no clean shutdown).
Before the hard crash, Windows logged a cascade of out-of-memory failures:

| Time | Event |
|---|---|
| 12:29–12:34 | `dwm.exe` crashes (`dwmcore.dll`, `c00001ad` / `c0000409`) → screen flicker/black |
| 12:30 | `chrome.exe`, `ONENOTE.EXE` crash (`KERNELBASE.dll`, `e0000008`) |
| 12:34 | `OUTLOOK.EXE` crashes in the Intel GPU driver (`igd10umt64xe.DLL`) |
| ~12:42 | PowerShell can no longer start (.NET error) |
| 12:44 | Hard power loss, reboot |

No bluescreens, no minidumps, no TDRs. The other shutdowns that week were all clean user shutdowns.

## Cause

The Website dev server (`npm run dev` → `next/dist/server/lib/start-server.js`, Next 16.2.7, Turbopack) spawned node children without limit, all running the same script:

```
node .next\dev\build\56416d4ae4ce586f.js <port>
```

That file is Turbopack's **PostCSS worker** (it evaluates `postcss.config.mjs` → `@tailwindcss/postcss` for `globals.css`). Normally the pool is a handful of processes. Measured live:

- 1,117 workers / 48.5 GB committed, then **1,960 workers / ~85 GB committed one minute later**. Page file peaked at ~30 GB.

The trigger is the **stale `.next/` cache**. `.next/dev/build/` was dated 2026-08-31 (several Next upgrades old).

## Proof (controlled repro)

The repro started `next dev -p 3123` with a watchdog that killed the tree once node processes exceeded the baseline by more than 30, and requested `/ratgeber/was-heisst-merak` after 10 s.

| Run | Result |
|---|---|
| With the old `.next/` | **81 workers within 2 s of start, before any request** → watchdog killed it |
| `.next/` moved aside | 3–5 node processes, flat for 90 s, including a page compile |

## Fix applied

- Moved the old cache out of the repo to `C:\Users\ajdin\next-cache-bak-20261121` (1.2 GB). Next rebuilt `.next/` on its own. ☐ Delete that folder once the dev server has run fine for a day.

## Gotcha found on the way

Do **not** keep a cache backup inside `Website/` (e.g. `.next.bak-…`). Only `.next/` is git-ignored, and Tailwind v4 scans every non-ignored file. While the backup sat in the repo, Tailwind pulled a garbage class out of the binary cache files (`[&::-webkit-.\2 \12 -�\3 �]:hidden`), and `globals.css` failed to parse (`Expected identifier in class selector`). Moving the backup out of the repo fixed it.

## If it happens again

1. Check: `(Get-Process node).Count`. Dozens or more with `.next\dev\build\` in the command line means the runaway is back.
2. Stop it: kill the node processes whose command line contains `Vrelo\Website` or `.next\dev\build` (leave the MCP servers alone).
3. Delete `Website/.next` (it is only a cache) and start `npm run dev` again.
4. If it recurs on a fresh cache, it is a new cause: run the repro below with a fresh `.next` and file a Next.js issue.

**Unconfirmed lead:** the crashed server ran from `c:\Users\…` (lowercase drive), which [CLAUDE.md](../CLAUDE.md) already warns against. The clean repro also used lowercase `c:`, so the drive letter alone does not cause it. A cache written under one casing and read under the other is not ruled out.

## Repro script (kills itself past the cap)

```powershell
$base = @(Get-Process node -ErrorAction SilentlyContinue).Count; $cap = 30
$dev = Start-Process cmd.exe -ArgumentList '/c','npx next dev -p 3123' -WorkingDirectory 'C:\Users\ajdin\Vrelo\Website' -PassThru -WindowStyle Hidden
function Stop-All {
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'Vrelo\\Website|\.next\\dev\\build|next dev -p 3123' } |
    ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} }
  try { Stop-Process -Id $dev.Id -Force -ErrorAction Stop } catch {}
}
try {
  for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep 2
    $w = @(Get-Process node -ErrorAction SilentlyContinue).Count - $base
    "{0,3}s extra node={1}" -f ($i*2), $w
    if ($w -gt $cap) { 'CAP EXCEEDED -> killing'; break }
    if ($i -eq 5) { Start-Process curl.exe -ArgumentList '-s','-o','NUL','--max-time','170','http://localhost:3123/ratgeber/was-heisst-merak' -WindowStyle Hidden }
  }
} finally { Stop-All }
```

Count with `Get-Process`, not `Get-CimInstance`: under load the WMI query returned nothing and the counter went blank.
