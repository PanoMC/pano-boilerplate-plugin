# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`pano-boilerplate-plugin` is the **starter template** a new Pano platform plugin is scaffolded from.
A Pano plugin is a **PF4J plugin**: a **Kotlin backend** (extends `PanoPlugin`, adds `@Endpoint` /
`@Dao` / `@EventListener` beans) plus an optional **Svelte UI** that mounts into the panel and/or
the active theme. It is built against `pano-web-platform`'s plugin API. The authoritative
explanation of the plugin system (lifecycle, per-plugin Spring context, dev loop, license model)
lives in **`../pano-web-platform/CLAUDE.md`** — read it before changing structure here.

## Stack

- Backend: **Kotlin + Gradle**, PF4J + Vert.x + Gson (`build.gradle.kts`, `gradle.properties`).
- UI: **Svelte 5 compiled with Rollup**, built via **Bun** into `src/main/resources/plugin-ui/`.
- Plugin metadata (`pluginId`, `pluginClass`, `pano-version`, …) comes from `gradle.properties`.

## Commands

```bash
bun install                          # install UI deps (uses @panomc/sdk)
./gradlew build                      # compile Kotlin + build & embed the UI zip → plugin jar
./gradlew build -Pnoui               # skip the Bun/Rollup UI build (fast backend-only iteration)
./gradlew build -PlicenseServer=prod # premium build (fetches the license public key)
bun run build                        # standalone one-shot UI build
bun run dev                          # DEV=true rollup -c --watch (live UI rebuild)
```

## Dev loop

For UI iteration, build the jar with `-Pnoui`, place the plugin in the platform's runtime
`plugins/` folder, run the platform in development mode (`init-ui = true`), and run `bun run dev`
here — the watched UI shows on a page refresh (F5) with no jar rebuild. **Kotlin/backend changes
and other jar resources (locale JSON) always need a jar rebuild + plugin reload.** Full details and
caveats: `../pano-web-platform/CLAUDE.md`.

## Conventions

- Premium plugins use the RS256-JWT license system (`PluginLicenseClient` / `verifyLicense()`).
- Releases (incl. publishing to the Pano resource store via `semantic-release-pano`) run on
  `alpha`/`beta`/`main` → use **conventional commit** messages.
