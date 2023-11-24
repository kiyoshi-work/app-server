import { Injectable } from '@nestjs/common';
import ERC20ABI from '@/blockchain/abi/ERC20.json';
import { BigNumber, Contract, ethers } from 'ethers';

export class ERC20 {
  private contract: Contract;

  private decimals: number;

  private chainId: number;

  private provider: ethers.providers.Provider;

  constructor(tokenAddress: string, provider: ethers.providers.Provider) {
    this.contract = new Contract(tokenAddress, ERC20ABI, provider);
    this.provider = provider;
  }

  async getDecimals() {
    if (!this.decimals) {
      this.decimals = Number(await this.contract.callStatic.decimals());
    }
    return this.decimals;
  }

  async getChainId() {
    if (!this.chainId) {
      this.chainId = (await this.provider.getNetwork()).chainId;
    }
    return this.chainId;
  }

  async getBalance(address: string): Promise<BigNumber> {
    return this.contract.callStatic.balanceOf(address);
  }

  async allowance(owner: string, spender: string): Promise<BigNumber> {
    return await this.contract.callStatic.allowance(owner, spender);
  }

  async parseValue(amount: string): Promise<BigNumber> {
    const decimals = await this.getDecimals();
    const modifiedAmount = Number(amount).toFixed(decimals);
    return ethers.utils.parseUnits(modifiedAmount, decimals);
  }
}

@Injectable()
export class ERC20Factory {
  private tokens: Record<string, ERC20> = {};

  create(tokenAddress: string, provider: ethers.providers.Provider) {
    if (!this.tokens[tokenAddress]) {
      this.tokens[tokenAddress] = new ERC20(tokenAddress, provider);
    }
    return this.tokens[tokenAddress];
  }
}
