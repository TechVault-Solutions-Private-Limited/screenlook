import { Command } from 'commander';
import { lookCommand } from './commands/look.js';
import { devicesCommand } from './commands/devices.js';
import { watchCommand } from './commands/watch.js';
import { diffCommand } from './commands/diff.js';
import { doctorCommand } from './commands/doctor.js';
import { setupCommand } from './commands/setup.js';

const program = new Command()
  .name('screenlook')
  .description('Give Claude Code eyes — capture device screens for AI feedback')
  .version('0.1.3');

program.addCommand(lookCommand);
program.addCommand(devicesCommand);
program.addCommand(watchCommand);
program.addCommand(diffCommand);
program.addCommand(doctorCommand);
program.addCommand(setupCommand);

// Default to 'look' if no command specified
program.action(async () => {
  await lookCommand.parseAsync(['look'], { from: 'user' });
});

process.on('unhandledRejection', (err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

program.parse();
