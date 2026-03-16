import { z } from 'zod';

export const tools = {
  screenlook_capture: {
    description:
      'Capture a screenshot from a connected mobile device or emulator. Returns the image so you can see exactly what the user sees on their screen.',
    inputSchema: z.object({
      device_id: z
        .string()
        .optional()
        .describe(
          'Target specific device by ID. If omitted, uses the only connected device or lists available devices.'
        ),
    }),
  },
  screenlook_devices: {
    description:
      'List all connected mobile devices and emulators available for screenshot capture.',
    inputSchema: z.object({}),
  },
  screenlook_diff: {
    description:
      'Capture a before screenshot, wait for code changes to take effect, then capture an after screenshot. Useful for verifying UI changes.',
    inputSchema: z.object({
      device_id: z.string().optional(),
      wait_seconds: z
        .number()
        .default(3)
        .describe('Seconds to wait between before and after captures. Default 3s to allow hot reload.'),
    }),
  },
  screenlook_doctor: {
    description: 'Check if system prerequisites (adb, xcrun, etc.) are properly installed.',
    inputSchema: z.object({}),
  },
};
