import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import { Device, CaptureResult } from './types.js';

const execFile = promisify(execFileCb);

export async function captureAndroid(device: Device): Promise<CaptureResult> {
  const start = Date.now();

  // Stream directly — no temp file on device
  const args = ['-s', device.id, 'exec-out', 'screencap', '-p'];

  const { stdout } = await execFile('adb', args, {
    encoding: 'buffer',
    maxBuffer: 50 * 1024 * 1024,
    timeout: 15_000,
  }) as { stdout: Buffer; stderr: Buffer };

  return {
    device,
    image: stdout,
    format: 'png',
    width: 0,
    height: 0,
    timestamp: new Date(),
    captureTimeMs: Date.now() - start,
  };
}
