import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';

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

export async function runDoctorChecks(): Promise<CheckResult[]> {
  const checks = await Promise.all([
    checkBinary('adb', ['version'], 'Android Debug Bridge (adb)'),
    checkBinary('xcrun', ['--version'], 'Xcode Command Line Tools (xcrun)'),
    checkBinary('pymobiledevice3', ['version'], 'pymobiledevice3 (iOS 17+)'),
    checkBinary('idevicescreenshot', ['--help'], 'libimobiledevice (idevicescreenshot)'),
  ]);
  return checks;
}
