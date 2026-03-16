import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Device, CaptureResult } from './types.js';

const execFile = promisify(execFileCb);

export async function captureIOSSimulator(device: Device): Promise<CaptureResult> {
  const start = Date.now();
  const tmpPath = path.join(os.tmpdir(), `screenlook-${device.id}-${Date.now()}.png`);

  await execFile('xcrun', ['simctl', 'io', device.id, 'screenshot', tmpPath], {
    timeout: 15_000,
  });

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
