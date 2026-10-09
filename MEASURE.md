# Steps to first result, measured (BP-01, decision 42)

Measured on 2026-10-08 with the rule of `recon/authoring-baseline.md` section D: from "Pano running, Development Mode on" to
"result visible"; each shell command, file edit or setting is one step; prerequisites and opening the browser are not counted.
Targets are from `design/00-overview.md` section 4 (plugin 3 steps, theme 4 steps). Baselines: plugin 16 documented / 11 needed /
about 440 lines; theme 8 documented / 5 needed / 116 lines.

## Setup of the measurement

- Pano: the frozen BOOT-01 bundle jar (`.open-frontend-run/bundle/pano`, JRE 21), in a throw-away instance made by a scratch copy of
  `e2e-instance.sh` (market-only readiness checks replaced by "health 200"), own database `pano_market_e2e_bp01`, port 18388, no
  other plugin. The bundle predates the API-level gate, so it does not refuse a jar without `api-level` (see "Findings").
- Development Mode on: `PUT /api/v1/panel/settings`. The panel field "Theme dev server": `PUT /api/v1/panel/frontend {devUrl}`
  (the call behind it; the panel page was not clicked).
- Plugin: `pano-plugin new my-plugin --local <umbrella>/theme-core` run in the instance's `plugins/` folder; `bun run dev`; Pano
  restarted with `e2e-instance.sh restart`; the page is `GET /my-plugin` through Pano, with the theme dev server below as the site.
- Theme: `theme-core new my-theme --local`; `bun run dev:ui` with `VITE_API_URL` pointing at the instance (the scaffold's `.env`
  says 8088; not counted); the colour is checked in `/style.css` served through Pano.
- Cold = empty `BUN_INSTALL_CACHE_DIR` and empty `GRADLE_USER_HOME` (Gradle distribution, Kotlin, dependencies and the JitPack Pano
  tag downloaded), fresh instance. Warm = the same caches, fresh instance and fresh scaffolds. The network is fast and the JDKs are in
  `/usr/lib/jvm`, so no JDK is downloaded. The Gradle toolchain Bun (1.2.0) is only fetched by a build without `-Pnoui`, which
  `dev` does not run.
- Everything is local (packages are not published): `file:` links, so the numbers include the local-mode problems below.

## (a) A scaffolded plugin shows its page

| | Target | Baseline | Measured |
|---|---|---|---|
| Steps documented / needed | 3 / 3 | 16 / 11 | **6 / 5** |
| Files edited by hand | 0 | 5+ | **2** |
| Files created by hand | 0 | 1 | **0** |
| Lines of docs read | one screen | about 440 | **29** (the scaffolded `README.md`; the quick-start box is 8 lines) |
| Wall-clock, cold cache | | | **88.5 s** (51.4 s of it Gradle downloads in the two `dev` runs) |
| Wall-clock, warm cache | | | **31.1 s** (19.2 s without the failed first `dev`) |

| Step | Cold s | Warm s |
|---|---:|---:|
| 1. `pano-plugin new my-plugin --local ...` (scaffold + `bun install`) | 2.0 | 0.2 |
| 2. `bun run dev` as shipped: fails in `build.gradle.kts` | 47.4 | 11.9 |
| 3. edit `build.gradle.kts` (add two imports) | 0 | 0 |
| 4. edit `GetHelloAPI.kt` (add `getValidationHandler`) | 0 | 0 |
| 5. `bun run dev` (`./gradlew build -Pnoui`, then rollup; "dev: built") | 33.1 | 13.1 |
| 6. restart Pano once (`e2e-instance.sh restart`, JVM up and plugin started) | 5.7 | 5.6 |
| open `/my-plugin` (200 with "Hello from", "The server says: hi") | 0.3 | 0.3 |

Needed = 5 (step 2 is the failed run). The target of 3 is **missed by steps 3 and 4** (two hand edits, both template defects of
the plugin scaffold, see Findings 1 and 2); the failed run of step 2 is the documented-but-not-needed sixth step. Without the two
defects the path is exactly the target: scaffold, `dev`, restart, 0 files written.

## (b) A scaffolded theme looks different from vanilla

| | Target | Baseline | Measured |
|---|---|---|---|
| Steps documented / needed | 4 / 4 | 8 / 5 | **8 / 7** (4 once the packages are published, see below) |
| Files edited by hand | 1 | 3 | **2** (`src/styles/tokens.scss`, and `package.json` for the local-mode workaround) |
| Files created by hand | 0 | 0 | **0** |
| Lines of docs read | one screen | 116 | **40** (`QUICKSTART-THEME.md`; the box and "The panel field" section, the part needed, are 20) |
| Wall-clock, cold cache | | | **9.1 s** |
| Wall-clock, warm cache | | | **7.2 s** |

| Step | Cold s | Warm s |
|---|---:|---:|
| 1. `theme-core new my-theme --local` (non-interactive: no install) | 0.0 | 0.0 |
| 2. `bun install`: fails, `@panomc/sdk@workspace:* failed to resolve` | 2.0 | 0.0 |
| 3. edit `package.json`: `overrides` for `@panomc/sdk` | 0 | 0 |
| 4. `bun install`: fails, postinstall "Module not found node_modules/@panomc/theme-core/bin/..." | 0.1 | 0.1 |
| 5. `bun install` again: green | 0.5 | 0.6 |
| 6. `bun run dev:ui` (Vite ready and Sass compiled) | 2.0 | 2.0 |
| 7. the panel field "Theme dev server" (site now served by the dev server) | 3.4 | 3.4 |
| 8. edit `src/styles/tokens.scss` (`$primary`), new colour served through Pano | 1.1 | 1.1 |

Needed = 7 (steps 2 is not needed; 5 follows 4). With the published packages the first install would be part of `new` (the
wizard asks "install now") and steps 2 to 5 collapse into it: **new, `dev:ui`, panel field, token edit = 4, the target**. That
case cannot be measured before the packages are published. In the unpublished state the target is **missed by three local-mode
steps** (the `package.json` override and two install runs), and the panel hint (Finding 4) is missing.

## Findings (each is outside this repo's paths, so nothing was changed there)

1. `theme-core/packages/plugin-kit/bin/templates/plugin/build.gradle.kts` does not compile: the `api-level` helper uses
   `java.util.zip.ZipFile` and `java.util.Properties` inside a Gradle script, where `java` is the Java plugin extension ("Unresolved
   reference: util"). Fix: `import java.util.Properties` and `import java.util.zip.ZipFile` at the top and drop the `java.util.`
   prefixes (the platform plugins already do). Applied by hand in this repo.
2. `routes/GetHelloAPI.kt` in the same template has no `getValidationHandler`; against the pinned JitPack tag
   `v1.0.0-alpha.463` that is an abstract member ("Class 'GetHelloAPI' is not abstract and does not implement ..."). Fix: add
   `override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler? = null` (valid on the pin and on a
   Pano whose `Route` already defaults to null). Applied by hand in this repo.
3. The same pin carries no `pano-api-level.properties`, so `build.gradle.kts` writes no `api-level` and a Pano with the version
   gate (PF-24) refuses the plugin: "needs API level 0 (TOO_OLD) ... is invalid and it will be disabled". Checked on a current Pano
   jar: the repo's jar with `apiLevel=1` starts, the same jar without the line is disabled. This repo sets `apiLevel=1` in
   `gradle.properties`; a scaffolded plugin needs the same line until the pin moves to a tag that has the file (or the template
   writes it). The bundle Pano used for the timings has no gate, so this extra edit is not in the table above.
4. `theme-core new --local` leaves a theme that does not install: `@panomc/theme-core` depends on `@panomc/sdk` as `workspace:*`,
   which bun cannot resolve outside the theme-core workspace, and the first install after a working override fails in postinstall
   (the second succeeds). Vanilla avoids it with a `theme-core/` submodule folder.
5. `bun run dev:ui` does not print the "Theme dev server" panel path that `QUICKSTART-THEME.md` promises (no code in theme-core
   prints it; the grep for the text finds only the doc), so a newcomer has to know the field exists. Setting the field while
   Development Mode is off saves it but does not start the proxy; saving the field again after switching the mode on does.
6. `./gradlew build` in this repo copies the jar to `panoPluginsDir=..`, which is the umbrella folder here (the template assumes
   the repo sits in a `plugins/` folder). The stray jar was deleted by hand after each build.

## Re-measured after the scaffold fix (CX-12, 2026-10-08)

The repo was regenerated with the same command as BP-01 (`pano-plugin new pano-plugin-boilerplate --local <umbrella>/theme-core --package com.panomc.plugins.boilerplate --name "Pano Plugin Boilerplate" --author PanoMC --no-install`) from theme-core 19e4ced and compared with this repo: `build.gradle.kts`, `GetHelloAPI.kt` and `gradle.properties` now equal the fresh scaffold (only comments differed, taken from the scaffold). The three hand edits of BP-01 are gone.

| Plugin path, warm cache | Target | BP-01 | Now |
|---|---|---|---|
| Steps needed | 3 | 5 (6 documented) | **3** (scaffold, `bun run dev`, restart Pano): no hand edit left, so the failed first `dev` is gone |
| Files edited by hand | 0 | 2 (3 with `apiLevel`) | **0** |
| `./gradlew build` | green | green after hand edits | **green, 8.7 s warm** on the unedited scaffold; `bun run build` green, 1.7 s |
| Page answered 200 on a slot instance | yes | on the frozen bundle | **not measured**, see below |

The page check did not run: `shots.mjs --jars current` fails in `smoke-install.sh` ("the theme to serve /"), the INFRA-02 / CX-05 defect (a Pano built from the current state does not serve `/` through vanilla-theme), and `--jars bundle` did not reach the plugin within the time box. The jar itself builds with the api-level line the scaffold writes. Owner: CX-05 (current build not serving `/`).

Theme path: CX-02 reports the first `bun install` of a `--local` theme now passes (sdk override plus hoisted bunfig), so the count is `new`, `dev:ui`, panel field, token edit = 4 steps, 1 file edited; not timed again here (no instance needed for the count, and the theme was not re-scaffolded in this unit).
