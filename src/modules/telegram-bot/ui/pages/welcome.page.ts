import { PhotoPage } from './page';
import { PhotoResponse } from '../../types/response';
import { COMMAND_KEYS } from '../../constants/command-keys';
import * as fs from 'fs';
import path from 'path';
import { I18nService } from 'nestjs-i18n';
import { createMenuButton } from '@/modules/telegram-bot/utils/ui';
import { buildPhotoOptions } from '@/modules/telegram-bot/utils/message';
export class WelcomePage implements PhotoPage {
  constructor(
    private readonly i18n?: I18nService,
    private readonly lang: string = 'en',
  ) {}

  build(data: { firstName?: string }): PhotoResponse {
    const { firstName } = data;
    const text = this.i18n
      ? this.i18n.t('start.verify.welcome_message', {
          args: {
            firstName,
          },
          lang: this.lang,
        })
      : 'Welcome';

    const imageFilePath = path.join(
      __dirname,
      '../../../../images/Verify Invitation Code.png',
    );
    const photo = fs.readFileSync(imageFilePath);
    const verifySignatureButton = this.i18n
      ? this.i18n.t('start.verify.verify_signature', {
          lang: this.lang,
        })
      : '🟢 Verify Invitation Code';
    const menu = buildPhotoOptions(
      [
        [
          createMenuButton(
            verifySignatureButton,
            COMMAND_KEYS.VERIFY_SIGNATURE_CODE,
          ),
        ],
      ],
      text,
    );

    return { photo, menu };
  }
}
