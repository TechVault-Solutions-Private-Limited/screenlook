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

  try {
    // Try Xcode 15+ method first (iOS 17+)
    await execFile(
      'xcrun',
      ['devicectl', 'device', 'info', 'screenshot', '--device', device.id, '--output', tmpPath],
      { timeout: 15_000 }
    );
  } catch {
    // Fallback to libimobiledevice
    await execFile('idevicescreenshot', ['-u', device.id, tmpPath], {
      timeout: 15_000,
    });
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
