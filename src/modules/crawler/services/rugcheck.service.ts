import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BigNumber from 'bignumber.js';
import { BaseRequestService } from './base-request.service';

@Injectable()
export class RugcheckService extends BaseRequestService {
  constructor(private readonly configService: ConfigService) {
    super(configService.get<string>('crawler.rugcheck.base_url'));
  }

  async getRugCheckInfo(address: string) {
    try {
      const options = {
        method: 'GET',
        url: `/v1/tokens/${address}/report`,
      };
      const rug_check_info: any = await this.sendRequest(options);
      let totallpLockedUSD = new BigNumber(0);
      let totalLpUsd = new BigNumber(0);

      rug_check_info.markets.forEach((market: any) => {
        totallpLockedUSD = totallpLockedUSD.plus(
          BigNumber(market.lp.lpLockedUSD),
        );
        totalLpUsd = totalLpUsd
          .plus(new BigNumber(market.lp.quoteUSD))
          .plus(new BigNumber(market.lp.baseUSD));
      });
      return {
        rugged: rug_check_info.rugged,
        score: rug_check_info.score,
        mint_authority: rug_check_info.mintAuthority,
        freeze_authority: rug_check_info.freezeAuthority,
        lp_locked: totallpLockedUSD.dividedBy(totalLpUsd).toNumber(),
      };
    } catch (e) {
      console.error('Error fetching rugcheck info: ', e);
      return null;
    }
  }
}
