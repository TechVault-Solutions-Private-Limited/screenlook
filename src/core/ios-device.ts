import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Device, CaptureResult } from './types.js';
import { debug } from '../utils/logger.js';

const execFile = promisify(execFileCb);

async function tryCapture(command: string, args: string[], timeout: number): Promise<boolean> {
  try {
    await execFile(command, args, { timeout });
    return true;
  } catch {
    return false;
  }
}

export async function captureIOSDevice(device: Device): Promise<CaptureResult> {
  const start = Date.now();
  const tmpPath = path.join(os.tmpdir(), `screenlook-${device.id}-${Date.now()}.png`);

  let captured = false;

  // Try pymobiledevice3 binary (requires tunneld running)
  if (!captured) {
    captured = await tryCapture(
      'pymobiledevice3',
      ['developer', 'dvt', 'screenshot', tmpPath, '--tunnel', device.id],
      30_000
    );
    if (captured) debug('Captured via pymobiledevice3 binary');
  }

  // Try python3 -m pymobiledevice3 (if binary not in PATH but module is installed)
  if (!captured) {
    captured = await tryCapture(
      'python3',
      ['-m', 'pymobiledevice3', 'developer', 'dvt', 'screenshot', tmpPath, '--tunnel', device.id],
      30_000
    );
    if (captured) debug('Captured via python3 -m pymobiledevice3');
  }

  // Try Homebrew Python specifically (macOS MCP servers often miss /opt/homebrew/bin in PATH)
  if (!captured) {
    captured = await tryCapture(
      '/opt/homebrew/bin/python3',
      ['-m', 'pymobiledevice3', 'developer', 'dvt', 'screenshot', tmpPath, '--tunnel', device.id],
      30_000
    );
    if (captured) debug('Captured via /opt/homebrew/bin/python3');
  }

  // Fallback to idevicescreenshot (works for pre-iOS 17 devices)
  if (!captured) {
    captured = await tryCapture(
      'idevicescreenshot',
      ['-u', device.id, tmpPath],
      15_000
    );
    if (captured) debug('Captured via idevicescreenshot');
  }

  if (!captured) {
    throw new Error(
      `Could not capture screenshot from iOS device ${device.id}.\n\n` +
        'For iOS 17+ physical devices, you need pymobiledevice3 with tunneld running:\n\n' +
        '  1. Install: pip3 install pymobiledevice3\n' +
        '  2. Start tunnel (keep running): sudo pymobiledevice3 remote tunneld\n' +
        '  3. Then screenlook will work automatically\n\n' +
        'For older iOS: brew install libimobiledevice\n' +
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
