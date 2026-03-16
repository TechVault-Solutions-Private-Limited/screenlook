import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli/index.ts',
    mcp: 'src/mcp/index.ts',
  },
  format: ['cjs'],
  dts: true,
  clean: true,
  target: 'node18',
});
