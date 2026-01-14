import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import terser from '@rollup/plugin-terser';

const production = !process.env.DEV;

const baseConfig = {
  input: "src/main.js",
  output: {
    format: "es",
    chunkFileNames: "[name]-[hash].js", // Chunk file naming
  },
  plugins: [
    del({
      targets: ["src/main/resources/plugin-ui/*"], // Always clean the resources folder
      runOnce: true, // Run only once
    }),
    production && terser()
  ],
  preserveEntrySignatures: "strict",
};

export default [
  // Server configuration
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      dir: "src/main/resources/plugin-ui/server", // Server directory
      entryFileNames: "server.mjs", // Server entry file
    },
    plugins: [
      ...baseConfig.plugins,
      resolve({
        dedupe: ["svelte"],
      }),
      svelte({
        compilerOptions: {
          generate: "server",
          css: "external",
        },
        emitCss: false,
      }),
    ],
  },
  // Client configuration
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      dir: "src/main/resources/plugin-ui/client", // Client directory
      entryFileNames: "client.mjs", // Client entry file
    },
    external: (id) => id.startsWith("svelte"),
    plugins: [
      ...baseConfig.plugins,
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      svelte({
        compilerOptions: {
          generate: "client",
          css: "external",
        },
        emitCss: false,
      }),
    ],
  },
];
