import { Page } from '../page';
import {
  EParseMode,
  buildMessageOptions,
  createMenuButton,
} from '../../../utils';
import { COMMAND_KEYS } from '../../../constants/command-keys';
import { PageResponse } from '@/telegram-bot/types';
import { I18nService } from 'nestjs-i18n';

export class TermsConfirmation implements Page {
  constructor(
    private readonly i18n: I18nService,
    private lang: string = 'en',
  ) {}

  build(): PageResponse {
    const text = this.i18n
      .t('start.verify.terms_confirmation', { lang: this.lang })
      .replace(/([{\[\]~}+)(#>!=\-.])/gm, '\\$1');

    const menu = buildMessageOptions(
      [
        [
          createMenuButton(
            this.i18n.t('start.button.accept', { lang: this.lang }),
            COMMAND_KEYS.USER_AGREE_TERMS,
          ),
          createMenuButton(
            this.i18n.t('start.button.decline', { lang: this.lang }),
            COMMAND_KEYS.USER_DISAGREE_TERMS,
          ),
        ],
      ],
      EParseMode.MarkdownV2,
    );
    return { text, menu };
  }
}
