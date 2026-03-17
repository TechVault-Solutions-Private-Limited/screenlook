import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import net from 'net';

const execFile = promisify(execFileCb);
const TIMEOUT = 10_000;

export interface CheckResult {
  ok: boolean;
  name: string;
  message: string;
}

export async function checkBinary(
  name: string,
  testArgs: string[],
  label: string
): Promise<CheckResult> {
  try {
    const { stdout } = await execFile(name, testArgs, { timeout: TIMEOUT });
    const version = stdout.trim().split('\n')[0];
    return { ok: true, name: label, message: version };
  } catch {
    return { ok: false, name: label, message: 'not found' };
  }
}

export async function checkTunnel(): Promise<CheckResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      socket.destroy();
      resolve({ ok: true, name: 'iOS 17+ Tunnel Service', message: 'Running (TCP port 49151)' });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, name: 'iOS 17+ Tunnel Service', message: 'Not running' });
    });
    socket.on('error', () => {
      resolve({ ok: false, name: 'iOS 17+ Tunnel Service', message: "Stopped - Run 'sudo pymobiledevice3 remote tunneld --protocol tcp --daemonize'" });
    });
    socket.connect(49151, '127.0.0.1');
  });
}

export async function runDoctorChecks(): Promise<CheckResult[]> {
  const checks = await Promise.all([
    checkBinary('adb', ['version'], 'Android Debug Bridge (adb)'),
    checkBinary('xcrun', ['--version'], 'Xcode Command Line Tools (xcrun)'),
    checkBinary('pymobiledevice3', ['version'], 'pymobiledevice3 (iOS 17+)'),
    checkTunnel(),
    checkBinary('idevicescreenshot', ['--help'], 'libimobiledevice (idevicescreenshot)'),
  ]);
  return checks;
}
