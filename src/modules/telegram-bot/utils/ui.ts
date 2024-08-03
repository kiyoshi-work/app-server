import { KeyboardOption, Menu } from '../types';

export const createMenuButton = (
  button: string,
  cmd = 'none',
  url?: string,
): Menu => ({
  text: button,
  callback_data: cmd,
  url: url,
});

export const createKeyboardOption = (text: string): KeyboardOption => ({
  text: text,
});

export const createMenuLabel = (label: string): Menu => ({
  text: label,
  callback_data: 'none',
});
