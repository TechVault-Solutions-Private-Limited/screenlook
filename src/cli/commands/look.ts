import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { capture } from '../../core/capture.js';
import { ScreenLookError } from '../../core/types.js';

export const lookCommand = new Command('look')
  .description('Capture a screenshot from connected device')
  .option('-d, --device <id>', 'Target specific device')
  .option('--base64', 'Output base64-encoded image to stdout')
  .option('--raw', 'Skip optimization, output full-res PNG')
  .option('-o, --output <path>', 'Custom output path')
  .action(async (options) => {
    try {
      const result = await capture({
        deviceId: options.device,
        optimize: !options.raw,
      });

      if (options.base64) {
        process.stdout.write(result.image.toString('base64'));
        return;
      }

      // Save to file
      const dir = options.output ? path.dirname(options.output) : './screenshots';
      await fs.mkdir(dir, { recursive: true });

      const filename =
        options.output ??
        path.join(dir, `screenshot-${result.device.id}-${Date.now()}.${result.format}`);

      await fs.writeFile(filename, result.image);

      console.log(
        `✓ Captured ${result.device.name} (${result.device.platform} ${result.device.connection})`
      );
      console.log(`  Resolution: ${result.width}x${result.height}`);
      console.log(`  Capture time: ${result.captureTimeMs}ms`);
      console.log(`  Saved: ${filename}`);
    } catch (err: unknown) {
      const exitCode = err instanceof ScreenLookError ? err.exitCode : 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✗ ${message}`);
      process.exit(exitCode);
    }
  });
