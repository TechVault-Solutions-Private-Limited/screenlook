import { Command } from 'commander';
import { detectDevices } from '../../core/detect.js';

export const devicesCommand = new Command('devices')
  .description('List all connected devices')
  .action(async () => {
    try {
      const devices = await detectDevices();

      if (devices.length === 0) {
        console.log('No devices found.');
        console.log('  Make sure a device is connected and tools (adb, xcrun) are in PATH.');
        console.log('  Run `screenlook doctor` for setup help.');
        process.exit(2);
      }

      console.log(`Found ${devices.length} device(s):\n`);
      for (const d of devices) {
        console.log(`  ${d.id} — ${d.name} (${d.platform} ${d.connection}) [${d.status}]`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✗ ${message}`);
      process.exit(1);
    }
  });
