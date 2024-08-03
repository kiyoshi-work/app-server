import { Page } from './page';

import { COMMAND_KEYS } from '../../constants/command-keys';
import { PageResponse } from '@/telegram-bot/types';
import { I18nService } from 'nestjs-i18n';
import { buildMessageOptions } from '../../utils/message';
import { createMenuButton } from '../../utils/ui';

export class MainPage implements Page {
  constructor(
    private readonly i18n: I18nService,
    private lang: string = 'en',
  ) {}

  build(): PageResponse {
    const text = this.i18n.t('start.main.welcome', {
      lang: this.lang,
    });

    const menu = buildMessageOptions([
      [
        createMenuButton(
          this.i18n.t('start.button.zkSync', { lang: this.lang }),
          COMMAND_KEYS.COMMING_SOON,
        ),
        createMenuButton(
          this.i18n.t('start.button.layer_zero', { lang: this.lang }),
          COMMAND_KEYS.COMMING_SOON,
        ),
      ],
      [
        createMenuButton(
          this.i18n.t('start.button.scroll', { lang: this.lang }),
          COMMAND_KEYS.COMMING_SOON,
        ),
        createMenuButton(
          this.i18n.t('start.button.linear', { lang: this.lang }),
          COMMAND_KEYS.COMMING_SOON,
        ),
      ],
    ]);

    console.log({ text, menu });

    return { text, menu };
  }
}
