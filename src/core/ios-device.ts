import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Device, CaptureResult } from './types.js';

const execFile = promisify(execFileCb);

export async function captureIOSDevice(device: Device): Promise<CaptureResult> {
  const start = Date.now();
  const tmpPath = path.join(os.tmpdir(), `screenlook-${device.id}-${Date.now()}.png`);

  // Try pymobiledevice3 first (iOS 17+ CoreDevice APIs)
  let captured = false;

  try {
    await execFile(
      'pymobiledevice3',
      ['developer', 'dvt', 'screenshot', tmpPath, '--tunnel', device.id],
      { timeout: 30_000 }
    );
    captured = true;
  } catch {
    // pymobiledevice3 not available or failed
  }

  // Fallback to idevicescreenshot (libimobiledevice 1.4.0+ supports iOS 17+)
  if (!captured) {
    try {
      await execFile('idevicescreenshot', ['-u', device.id, tmpPath], {
        timeout: 15_000,
      });
      captured = true;
    } catch {
      // idevicescreenshot not available or failed
    }
  }

  if (!captured) {
    throw new Error(
      `Could not capture screenshot from iOS device ${device.id}.\n` +
        'Install one of these tools:\n' +
        '  - pymobiledevice3 (recommended for iOS 17+): pip3 install pymobiledevice3\n' +
        '  - libimobiledevice (1.4.0+ for iOS 17+): brew install libimobiledevice\n' +
        'Run `screenlook doctor` for more details.'
    );
  }

  const image = await fs.readFile(tmpPath);

  try {
    await fs.unlink(tmpPath);
  } catch {
    // Cleanup failure is non-fatal
  }

  return {
    device,
    image,
    format: 'png',
    width: 0,
    height: 0,
    timestamp: new Date(),
    captureTimeMs: Date.now() - start,
  };
}
