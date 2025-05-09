import { CommandData } from './command-data.interface';

export interface Command {
  execute(data: CommandData): Promise<void>;
  canHandle(data: CommandData): boolean;
}
