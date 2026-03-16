import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import { Device } from './types.js';
import { debug } from '../utils/logger.js';

const execFile = promisify(execFileCb);
const TIMEOUT = 10_000;

export async function detectDevices(): Promise<Device[]> {
  const devices: Device[] = [];

  // Android devices (physical + emulator)
  try {
    const { stdout } = await execFile('adb', ['devices', '-l'], { timeout: TIMEOUT });
    devices.push(...parseAdbDevices(stdout));
  } catch {
    debug('adb not available — skipping Android detection');
  }

  // iOS Simulators (macOS only)
  try {
    const { stdout } = await execFile(
      'xcrun',
      ['simctl', 'list', 'devices', 'booted', '--json'],
      { timeout: TIMEOUT }
    );
    devices.push(...parseSimulatorDevices(stdout));
  } catch {
    debug('xcrun simctl not available — skipping iOS Simulator detection');
  }

  // iOS Physical devices (macOS only)
  try {
    const { stdout } = await execFile(
      'xcrun',
      ['devicectl', 'list', 'devices', '--json-output', '-'],
      { timeout: TIMEOUT }
    );
    devices.push(...parsePhysicalIOSDevices(stdout));
  } catch {
    // Try libimobiledevice fallback
    try {
      const { stdout } = await execFile('idevice_id', ['-l'], { timeout: TIMEOUT });
      devices.push(...parseIdeviceList(stdout));
    } catch {
      debug('No iOS physical device tools available');
    }
  }

  return devices;
}

export function parseAdbDevices(stdout: string): Device[] {
  const devices: Device[] = [];
  const lines = stdout.trim().split('\n');

  // Skip the first line ("List of devices attached")
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    const serial = parts[0];
    const statusStr = parts[1];

    if (!serial || !statusStr) continue;

    let status: Device['status'] = 'offline';
    if (statusStr === 'device') status = 'online';
    else if (statusStr === 'unauthorized') status = 'unauthorized';

    // Extract model name from properties
    const modelMatch = line.match(/model:(\S+)/);
    const name = modelMatch ? modelMatch[1].replace(/_/g, ' ') : serial;

    const connection = /^emulator-\d+$/.test(serial) ? 'emulator' : 'physical';

    devices.push({
      id: serial,
      name,
      platform: 'android',
      connection,
      status,
    });
  }

  return devices;
}

export function parseSimulatorDevices(jsonStr: string): Device[] {
  const devices: Device[] = [];

  try {
    const parsed = JSON.parse(jsonStr);
    const runtimes = parsed.devices || {};

    for (const runtime of Object.keys(runtimes)) {
      for (const device of runtimes[runtime]) {
        if (device.state === 'Booted') {
          devices.push({
            id: device.udid,
            name: device.name,
            platform: 'ios',
            connection: 'simulator',
            status: 'online',
          });
        }
      }
    }
  } catch {
    debug('Failed to parse xcrun simctl JSON output');
  }

  return devices;
}

export function parsePhysicalIOSDevices(jsonStr: string): Device[] {
  const devices: Device[] = [];

  try {
    const parsed = JSON.parse(jsonStr);
    const deviceList = parsed.result?.devices || [];

    for (const device of deviceList) {
      const identifier =
        device.hardwareProperties?.udid ||
        device.identifier ||
        device.deviceProperties?.uniqueDeviceID;
      const name =
        device.deviceProperties?.name ||
        device.hardwareProperties?.marketingName ||
        'iOS Device';

      if (identifier) {
        devices.push({
          id: identifier,
          name,
          platform: 'ios',
          connection: 'physical',
          status: 'online',
        });
      }
    }
  } catch {
    debug('Failed to parse xcrun devicectl JSON output');
  }

  return devices;
}

export function parseIdeviceList(stdout: string): Device[] {
  const devices: Device[] = [];
  const lines = stdout.trim().split('\n');

  for (const line of lines) {
    const udid = line.trim();
    if (udid) {
      devices.push({
        id: udid,
        name: 'iOS Device',
        platform: 'ios',
        connection: 'physical',
        status: 'online',
      });
    }
  }

  return devices;
}
