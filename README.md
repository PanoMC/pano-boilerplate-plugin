# Pano Plugin Boilerplate

A plugin for [Pano](https://panomc.com), scaffolded by `bunx @panomc/plugin-kit new pano-plugin-boilerplate`.

## Quick start

```
Needs: JDK 17+, Bun, Pano with Development Mode on
cd <pano>/plugins && bunx @panomc/plugin-kit new my-plugin    # installs
cd my-plugin && bun run dev        # first run builds the jar (minutes); restart Pano once, then open /my-plugin
New page:     src/theme/views/X.svelte with  export const view = { path: '/x' }
Helper:       any .js beside it, imported as usual (ships readable)
Closed logic: src/theme/controllers/x.js   ->   plugin('my-plugin').require('x')
Panel page:   src/main.js  ->  pano.ui.page.register({ path, component })   (unchanged)
Look:         classes <ns>-x__part; a <style> block is allowed (every selector starts with .<ns>-)
Sample data:  bunx pano-plugin samples X          Check: bunx pano-plugin check
```

This plugin is `pano-plugin-boilerplate`: open `/pano-plugin-boilerplate` on the site to see `src/theme/views/HelloPage.svelte`, which shows the answer
of `src/main/kotlin/com/panomc/plugins/boilerplate/routes/GetHelloAPI.kt`.

| Where | What |
|---|---|
| `src/theme/views/` | the site pages, one `.svelte` file each (`export const view = { path }`) |
| `src/main/kotlin/` | the plugin class and its API endpoints |
| `src/main/resources/frontend-targets.json` | links this plugin sends out (empty), see `ExampleFallbackPage.kt` |
| `src/main/resources/locales/` | texts, keyed `plugins.pano-plugin-boilerplate.<key>` |
| `gradle.properties` | id, name, class, author, `panoPluginsDir` (where the jar is copied) |

Build the jar with `./gradlew build` (add `-Pnoui` to skip the UI build); `bun run build` builds only the UI.

Working with an AI coding agent: `agent-guide/README.md` routes to the rule file for each task (new view, endpoint,
panel page, release, checks); `CLAUDE.md` / `AGENTS.md` point the agent at it. The longer docs are on
[panomc.com/docs](https://panomc.com/docs/handbook/addon/).
