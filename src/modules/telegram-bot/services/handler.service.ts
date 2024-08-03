import { Inject, Injectable } from '@nestjs/common';
import { COMMAND_KEYS } from '@/telegram-bot/constants/command-keys';
import {
  Handler,
  StartHandler,
  ComingSoonHandler,
  VerifySignatureCodeButtonHandler,
  UserAgreeToTermsHandlers,
  UserDisagreeToTermsHandlers,
} from '@/telegram-bot/handlers';
import { UserInputHandler } from '../handlers/user-input.handler';

@Injectable()
export class HandlerService {
  @Inject(StartHandler)
  private startHandler: StartHandler;

  @Inject(ComingSoonHandler)
  private comingSoonHandler: ComingSoonHandler;

  @Inject(UserInputHandler)
  private userInputHandler: UserInputHandler;

  @Inject(VerifySignatureCodeButtonHandler)
  private verifySignatureCodeButtonHandler: VerifySignatureCodeButtonHandler;

  @Inject(UserAgreeToTermsHandlers)
  private userAgreeToTermsHandlers: UserAgreeToTermsHandlers;

  @Inject(UserDisagreeToTermsHandlers)
  private userDisagreeToTermsHandlers: UserDisagreeToTermsHandlers;

  getHandlers(): Record<string, Handler> {
    return {
      [COMMAND_KEYS.START]: this.startHandler,
      [COMMAND_KEYS.USER_INPUT]: this.userInputHandler,
      [COMMAND_KEYS.COMMING_SOON]: this.comingSoonHandler,
      [COMMAND_KEYS.VERIFY_SIGNATURE_CODE]:
        this.verifySignatureCodeButtonHandler,
      [COMMAND_KEYS.USER_AGREE_TERMS]: this.userAgreeToTermsHandlers,
      [COMMAND_KEYS.USER_DISAGREE_TERMS]: this.userDisagreeToTermsHandlers,
    };
  }
}
