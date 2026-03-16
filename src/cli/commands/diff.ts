import { Command } from 'commander';
import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { capture } from '../../core/capture.js';
import { ScreenLookError } from '../../core/types.js';

export const diffCommand = new Command('diff')
  .description('Capture before/after screenshots for comparison')
  .option('-d, --device <id>', 'Target specific device')
  .option('-w, --wait <seconds>', 'Wait N seconds instead of prompting for Enter')
  .action(async (options) => {
    try {
      const captureOpts = { deviceId: options.device, optimize: true };
      const dir = './screenshots';
      await fs.mkdir(dir, { recursive: true });

      const ts = Date.now();

      // Capture "before"
      console.log('Capturing BEFORE screenshot...');
      const before = await capture(captureOpts);
      const beforeFile = path.join(
        dir,
        `diff-${before.device.id}-before-${ts}.${before.format}`
      );
      await fs.writeFile(beforeFile, before.image);
      console.log(`  Saved: ${beforeFile}`);

      // Wait for changes
      if (options.wait) {
        const seconds = parseInt(options.wait, 10);
        console.log(`\nWaiting ${seconds}s for changes...`);
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      } else {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        await new Promise<void>((resolve) =>
          rl.question('\nMake your changes, then press Enter...', () => {
            rl.close();
            resolve();
          })
        );
      }

      // Capture "after"
      console.log('Capturing AFTER screenshot...');
      const after = await capture(captureOpts);
      const afterFile = path.join(dir, `diff-${after.device.id}-after-${ts}.${after.format}`);
      await fs.writeFile(afterFile, after.image);
      console.log(`  Saved: ${afterFile}`);

      console.log('\nDiff complete:');
      console.log(`  Before: ${beforeFile}`);
      console.log(`  After:  ${afterFile}`);
    } catch (err: unknown) {
      const exitCode = err instanceof ScreenLookError ? err.exitCode : 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✗ ${message}`);
      process.exit(exitCode);
    }
  });
