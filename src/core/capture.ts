import { detectDevices } from './detect.js';
import { captureAndroid } from './android.js';
import { captureIOSSimulator } from './ios-simulator.js';
import { captureIOSDevice } from './ios-device.js';
import { optimizeCapture } from './optimize.js';
import { Device, CaptureResult, CaptureOptions, ScreenLookError } from './types.js';

export async function capture(options: CaptureOptions = {}): Promise<CaptureResult> {
  const devices = await detectDevices();

  if (devices.length === 0) {
    throw new ScreenLookError(
      'No devices found. Make sure:\n' +
        '  - Android: USB debugging enabled, device connected, `adb` in PATH\n' +
        '  - iOS Sim: Simulator running, Xcode installed\n' +
        '  - iOS Device: Device paired/trusted, Xcode 15+ installed\n' +
        'Run `screenlook doctor` to diagnose.',
      2
    );
  }

  // Select device
  let device: Device;
  if (options.deviceId) {
    const found = devices.find((d) => d.id === options.deviceId);
    if (!found) {
      throw new ScreenLookError(
        `Device ${options.deviceId} not found. Available: ${devices.map((d) => d.id).join(', ')}`,
        1
      );
    }
    device = found;
  } else if (devices.length === 1) {
    device = devices[0];
  } else {
    throw new ScreenLookError(
      `Multiple devices found. Specify one with --device:\n${devices.map((d) => `  ${d.id} (${d.platform} ${d.connection})`).join('\n')}`,
      1
    );
  }

  // Capture based on platform/connection
  let result: CaptureResult;
  if (device.platform === 'android') {
    result = await captureAndroid(device);
  } else if (device.connection === 'simulator') {
    result = await captureIOSSimulator(device);
  } else {
    result = await captureIOSDevice(device);
  }

  // Optimize unless explicitly disabled
  if (options.optimize !== false) {
    result = await optimizeCapture(result, options);
  }

  return result;
}
