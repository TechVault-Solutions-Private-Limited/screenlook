import { Command } from 'commander';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { capture } from '../../core/capture.js';

export const watchCommand = new Command('watch')
  .description('Watch for file changes, auto-capture on save')
  .option('-d, --device <id>', 'Target specific device')
  .option('--dir <path>', 'Directory to watch', './src')
  .option('--debounce <ms>', 'Debounce delay in ms', '2000')
  .action(async (options) => {
    const watchDir = options.dir;
    const debounceMs = parseInt(options.debounce, 10);
    let counter = 0;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const dir = './screenshots';
    await fsp.mkdir(dir, { recursive: true });

    console.log(`Watching ${watchDir} for changes (debounce: ${debounceMs}ms)...`);
    console.log('Press Ctrl+C to stop.\n');

    const doCapture = async () => {
      try {
        counter++;
        const result = await capture({
          deviceId: options.device,
          optimize: true,
        });

        const num = String(counter).padStart(3, '0');
        const filename = path.join(dir, `watch-${num}.${result.format}`);
        await fsp.writeFile(filename, result.image);

        console.log(
          `[${num}] Captured ${result.device.name} — ${result.width}x${result.height} — ${filename}`
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`✗ Capture failed: ${message}`);
      }
    };

    const watcher = fs.watch(watchDir, { recursive: true }, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doCapture, debounceMs);
    });

    process.on('SIGINT', () => {
      watcher.close();
      console.log(`\nStopped. ${counter} screenshots captured.`);
      process.exit(0);
    });
  });
