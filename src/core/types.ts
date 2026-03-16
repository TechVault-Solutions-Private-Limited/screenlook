export type DevicePlatform = 'android' | 'ios';
export type DeviceConnection = 'physical' | 'emulator' | 'simulator';

export interface Device {
  id: string;
  name: string;
  platform: DevicePlatform;
  connection: DeviceConnection;
  status: 'online' | 'offline' | 'unauthorized';
}

export interface CaptureResult {
  device: Device;
  image: Buffer;
  format: 'png' | 'jpeg';
  width: number;
  height: number;
  timestamp: Date;
  captureTimeMs: number;
}

export interface CaptureOptions {
  deviceId?: string;
  optimize?: boolean;
  maxDimension?: number;
  quality?: number;
}

export class ScreenLookError extends Error {
  constructor(message: string, public exitCode: number = 1) {
    super(message);
    this.name = 'ScreenLookError';
  }
}
