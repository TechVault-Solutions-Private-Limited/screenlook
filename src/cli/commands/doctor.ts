import { Command } from 'commander';
import { runDoctorChecks } from '../../utils/prerequisites.js';
import { detectDevices } from '../../core/detect.js';

export const doctorCommand = new Command('doctor')
  .description('Check system prerequisites')
  .action(async () => {
    console.log('ScreenLook Doctor\n');

    const checks = await runDoctorChecks();
    let anyOk = false;

    for (const check of checks) {
      console.log(`${check.ok ? '✓' : '✗'} ${check.name}: ${check.message}`);
      if (check.ok) anyOk = true;
    }

    // Install hints for failed checks
    for (const check of checks) {
      if (check.ok) continue;
      if (check.name.includes('adb')) {
        console.log(
          '  Install adb: brew install android-platform-tools (macOS) | apt install adb (Linux) | Android SDK Platform Tools (Windows)'
        );
      } else if (check.name.includes('xcrun')) {
        console.log('  Install xcrun: xcode-select --install (macOS only)');
      } else if (check.name.includes('idevicescreenshot')) {
        console.log('  Install: brew install libimobiledevice (macOS only)');
      }
    }

    // List connected devices
    console.log('\nConnected Devices:');
    const devices = await detectDevices();
    if (devices.length === 0) {
      console.log('  No devices found');
    } else {
      for (const d of devices) {
        console.log(`  ${d.id} — ${d.name} (${d.platform} ${d.connection}) [${d.status}]`);
      }
    }

    if (!anyOk) process.exit(3);
  });
