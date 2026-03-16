import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { capture } from '../core/capture.js';
import { detectDevices } from '../core/detect.js';
import { runDoctorChecks } from '../utils/prerequisites.js';
import { tools } from './tools.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'screenlook',
    version: '0.1.0',
  });

  // screenlook_capture — the main "look at my screen" tool
  server.tool(
    'screenlook_capture',
    tools.screenlook_capture.description,
    tools.screenlook_capture.inputSchema.shape,
    async ({ device_id }) => {
      try {
        const result = await capture({ deviceId: device_id });

        return {
          content: [
            {
              type: 'image' as const,
              data: result.image.toString('base64'),
              mimeType: 'image/jpeg',
            },
            {
              type: 'text' as const,
              text: `Screenshot captured from ${result.device.name} (${result.device.platform}, ${result.device.connection}) — ${result.width}x${result.height}, captured in ${result.captureTimeMs}ms`,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
        };
      }
    }
  );

  // screenlook_devices
  server.tool(
    'screenlook_devices',
    tools.screenlook_devices.description,
    tools.screenlook_devices.inputSchema.shape,
    async () => {
      try {
        const devices = await detectDevices();
        return {
          content: [
            {
              type: 'text' as const,
              text:
                devices.length === 0
                  ? 'No devices found. Run screenlook doctor for setup help.'
                  : devices
                      .map(
                        (d) =>
                          `${d.id} — ${d.name} (${d.platform} ${d.connection}) [${d.status}]`
                      )
                      .join('\n'),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
        };
      }
    }
  );

  // screenlook_diff
  server.tool(
    'screenlook_diff',
    tools.screenlook_diff.description,
    tools.screenlook_diff.inputSchema.shape,
    async ({ device_id, wait_seconds = 3 }) => {
      try {
        const before = await capture({ deviceId: device_id });

        // Wait for hot reload / code changes
        await new Promise((resolve) => setTimeout(resolve, wait_seconds * 1000));

        const after = await capture({ deviceId: device_id });

        return {
          content: [
            { type: 'text' as const, text: '**BEFORE:**' },
            {
              type: 'image' as const,
              data: before.image.toString('base64'),
              mimeType: 'image/jpeg',
            },
            { type: 'text' as const, text: '**AFTER:**' },
            {
              type: 'image' as const,
              data: after.image.toString('base64'),
              mimeType: 'image/jpeg',
            },
            {
              type: 'text' as const,
              text: `Diff captured from ${before.device.name}. Before: ${before.captureTimeMs}ms, After: ${after.captureTimeMs}ms. Wait: ${wait_seconds}s.`,
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
        };
      }
    }
  );

  // screenlook_doctor
  server.tool(
    'screenlook_doctor',
    tools.screenlook_doctor.description,
    tools.screenlook_doctor.inputSchema.shape,
    async () => {
      try {
        const checks = await runDoctorChecks();
        const devices = await detectDevices();

        return {
          content: [
            {
              type: 'text' as const,
              text: [
                'ScreenLook System Check:',
                ...checks.map((c) => `${c.ok ? '✓' : '✗'} ${c.name}: ${c.message}`),
                '',
                `Connected Devices: ${devices.length}`,
                ...devices.map(
                  (d) => `  ${d.id} — ${d.name} (${d.platform} ${d.connection})`
                ),
              ].join('\n'),
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
        };
      }
    }
  );

  return server;
}
