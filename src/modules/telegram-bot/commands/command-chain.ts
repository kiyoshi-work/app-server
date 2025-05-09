import { Injectable } from '@nestjs/common';
import { StartCommand } from './start.command';
import { CommandData } from './interfaces/command-data.interface';
import { Command } from './interfaces/command.interface';
import { TelegramBot } from '../telegram-bot';
import { LogCommand } from './log.command';
import { InputInvitationCodeCommand } from './input-invitation-code.command';
@Injectable()
export class CommandChain {
  private commands: Command[] = [];
  private commandsByPrefix: Map<string, Command[]> = new Map();

  constructor(
    private readonly startCommand: StartCommand,
    private readonly logCommand: LogCommand,
    private readonly inputInvitationCodeCommand: InputInvitationCodeCommand,
    private readonly bot: TelegramBot,
  ) {
    this.commands = [startCommand, logCommand, inputInvitationCodeCommand];

    // Initialize prefix-based command grouping
    this.organizeCommandsByPrefix();
  }

  private organizeCommandsByPrefix() {
    // Define common command prefixes
    const prefixes = ['/start', '/log'];

    // Initialize empty arrays for each prefix
    prefixes.forEach((prefix) => {
      this.commandsByPrefix.set(prefix, []);
    });

    // Misc category for commands that don't match specific prefixes
    this.commandsByPrefix.set('misc', []);

    // Group commands by their likely prefixes
    for (const command of this.commands) {
      let assigned = false;

      // Check command's name to determine likely prefix
      const commandName = command.constructor.name.toLowerCase();

      // Try to match command to a prefix group
      for (const prefix of prefixes) {
        if (this.commandMatchesPrefix(command, commandName, prefix)) {
          this.commandsByPrefix.get(prefix).push(command);
          assigned = true;
          break;
        }
      }

      // Add to misc if not assigned to a specific prefix
      if (!assigned) {
        this.commandsByPrefix.get('misc').push(command);
      }
    }
  }

  private commandMatchesPrefix(
    command: Command,
    commandName: string,
    prefix: string,
  ): boolean {
    // Try to determine if a command is likely to handle a specific prefix
    // First check if command has a pattern property that can be examined
    if ('pattern' in command) {
      const patternStr = String(command['pattern']);
      if (patternStr.includes(prefix)) {
        return true;
      }
    }

    // Check based on naming conventions
    const prefixWithoutSlash = prefix.substring(1);
    if (commandName.includes(prefixWithoutSlash)) {
      return true;
    }

    // Special case for start command variants
    if (
      prefix === '/start' &&
      (commandName.includes('direct') ||
        commandName.includes('chart') ||
        commandName === 'startcommand')
    ) {
      return true;
    }

    return false;
  }

  async execute(data: CommandData): Promise<void> {
    const text = data.text.toLowerCase();
    let handled = false;
    let relevantCommands: Command[] = [];

    // Extract the command prefix to find relevant command group
    const spaceIndex = text.indexOf(' ');
    const prefix = spaceIndex > 0 ? text.substring(0, spaceIndex) : text;

    // Special case for /start commands which have many variants
    if (text.startsWith('/start')) {
      relevantCommands = this.commandsByPrefix.get('/start') || [];
    } else {
      // Find commands for this specific prefix
      for (const [cmdPrefix, commands] of this.commandsByPrefix.entries()) {
        if (prefix === cmdPrefix || text.startsWith(cmdPrefix)) {
          relevantCommands = [...commands];
          break;
        }
      }
    }

    // If no specific prefix group matched, use misc commands
    if (relevantCommands.length === 0) {
      relevantCommands = this.commandsByPrefix.get('misc') || [];
    }

    // First check the most relevant commands
    for (const command of relevantCommands) {
      if (command.canHandle(data)) {
        await command.execute(data);
        handled = true;
        return;
      }
    }

    // If not handled by the prioritized commands, try all other commands
    if (!handled) {
      // Create a list of commands not yet checked
      const checkedCommands = new Set(relevantCommands);
      const remainingCommands = this.commands.filter(
        (cmd) => !checkedCommands.has(cmd),
      );

      for (const command of remainingCommands) {
        if (command.canHandle(data)) {
          await command.execute(data);
          handled = true;
          return;
        }
      }
    }

    if (!handled) {
      await this.bot.sendMessage(
        data.chatId,
        [
          '<b>❌ Invalid format.</b>',
          'Try correct command like: /start or /log',
        ].join('\n'),
        { parse_mode: 'HTML' },
      );
    }
  }
}
