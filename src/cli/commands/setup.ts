import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';

const execFile = promisify(execFileCb);

interface IDEConfig {
  name: string;
  configPath: string;
  key: string; // 'mcpServers' or 'servers'
}

function getIDEConfigs(): IDEConfig[] {
  const home = os.homedir();
  const isWindows = process.platform === 'win32';

  return [
    {
      name: 'Cursor',
      configPath: path.join(home, '.cursor', 'mcp.json'),
      key: 'mcpServers',
    },
    {
      name: 'VS Code (GitHub Copilot)',
      configPath: path.join(home, '.vscode', 'mcp.json'),
      key: 'servers',
    },
    {
      name: 'Antigravity',
      configPath: isWindows
        ? path.join(home, '.gemini', 'antigravity', 'mcp_config.json')
        : path.join(home, '.gemini', 'antigravity', 'mcp_config.json'),
      key: 'mcpServers',
    },
  ];
}

const MCP_ENTRY = {
  command: 'npx',
  args: ['-y', '-p', 'screenlook', 'screenlook-mcp'],
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function setupClaudeCode(): Promise<boolean> {
  try {
    await execFile('claude', ['mcp', 'add', 'screenlook', '--', 'screenlook-mcp'], {
      timeout: 15_000,
    });
    return true;
  } catch {
    return false;
  }
}

async function setupIDE(ide: IDEConfig): Promise<'installed' | 'already' | 'skipped'> {
  const configDir = path.dirname(ide.configPath);

  // Check if IDE directory exists (indicator that IDE is installed)
  if (!await dirExists(configDir)) {
    return 'skipped';
  }

  // Read existing config or start fresh
  let config: Record<string, unknown> = {};
  if (await fileExists(ide.configPath)) {
    try {
      const content = await fs.readFile(ide.configPath, 'utf-8');
      config = JSON.parse(content);
    } catch {
      config = {};
    }
  }

  // Check if already configured
  const servers = (config[ide.key] as Record<string, unknown>) || {};
  if (servers.screenlook) {
    return 'already';
  }

  // Add screenlook
  servers.screenlook = MCP_ENTRY;
  config[ide.key] = servers;

  // Write config
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(ide.configPath, JSON.stringify(config, null, 2) + '\n');
  return 'installed';
}

export const setupCommand = new Command('setup')
  .description('Auto-configure ScreenLook MCP for all detected IDEs')
  .action(async () => {
    console.log('ScreenLook Setup\n');
    console.log('Detecting installed IDEs...\n');

    let anyInstalled = false;

    // Claude Code
    try {
      await execFile('claude', ['--version'], { timeout: 5_000 });
      const result = await setupClaudeCode();
      if (result) {
        console.log('  ✓ Claude Code — configured');
        anyInstalled = true;
      } else {
        console.log('  ✗ Claude Code — failed to configure');
      }
    } catch {
      console.log('  - Claude Code — not installed, skipping');
    }

    // JSON-config IDEs
    const ides = getIDEConfigs();
    for (const ide of ides) {
      const result = await setupIDE(ide);
      switch (result) {
        case 'installed':
          console.log(`  ✓ ${ide.name} — configured`);
          anyInstalled = true;
          break;
        case 'already':
          console.log(`  ✓ ${ide.name} — already configured`);
          anyInstalled = true;
          break;
        case 'skipped':
          console.log(`  - ${ide.name} — not installed, skipping`);
          break;
      }
    }

    console.log('');
    if (anyInstalled) {
      console.log('Done! Restart your IDE(s) for ScreenLook to activate.');
      console.log('Then just say "look at my screen" and your agent will see your device.');
    } else {
      console.log('No supported IDEs detected.');
      console.log('Manually add ScreenLook to your MCP config:');
      console.log('  npx -y -p screenlook screenlook-mcp');
    }
  });
