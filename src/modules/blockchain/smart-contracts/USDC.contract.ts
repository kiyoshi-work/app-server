import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Wallet } from 'ethers';
import { CHAINS, CONTRACTS_ADDRESS } from '../configs';
import USDCAbi from '../abi/MockUSDC.json';
import { NetworkChainId } from '../options';
import { formatWei6 } from '@/shared/utils/helper';

@Injectable()
export class USDCContract {
  public USDCContract: ethers.Contract;
  public chainId: number;

  public nextDeployers: Record<string, string>;
  public deployers: Record<string, Wallet>;
  public currDeployer: string;

  constructor(
    @Inject('BLAST_CONNECTION')
    public provider: ethers.providers.JsonRpcProvider,
    @Inject('NETWORK_CHAIN_ID')
    private networkChainId: NetworkChainId,
    private readonly configService: ConfigService,
  ) {
    this.chainId = CHAINS[this.networkChainId.blast].chainId;
    const contractAddresses = CONTRACTS_ADDRESS[this.chainId].USDC;
    this._loadDeployers();
    this.USDCContract = new ethers.Contract(
      contractAddresses,
      USDCAbi.abi,
      this.provider,
    );
  }

  private _loadDeployers() {
    const batcherPks = this.configService.get<string>(
      'blockchain.wallet.deployerPks',
    )?.split(',') || [];
    const batchers = {}
    const nextBatchers = {}
    batcherPks.forEach((batcherPk, ind: number) => {
      batchers[batcherPk] = new Wallet(batcherPk, this.provider);
      if (ind < batcherPks.length - 1) {
        nextBatchers[batcherPk] = batcherPks[ind + 1];
      } else {
        nextBatchers[batcherPk] = batcherPks[0];
      }
    });
    this.deployers = batchers;
    this.nextDeployers = nextBatchers;
    this.currDeployer = batcherPks?.[0];
  }

  getDeployerWalletToSend() {
    this.currDeployer = this.nextDeployers[this.currDeployer]
    return this.deployers[this.currDeployer];
  }

  public async transferUSDC(address: string, funding: number) {
    try {
      const deployer = this.getDeployerWalletToSend()
      const txh = await (await this.USDCContract.connect(deployer).transfer(address, formatWei6(funding.toString()))).wait();
      return txh.transactionHash;
    } catch (error) {
      throw error;
    }
  }

  async sendETH(address: string, funding: number) {
    try {
      const deployer = this.getDeployerWalletToSend()
      const tx = await deployer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(funding.toString())
      });
      return tx.hash;
    } catch (error) {
      throw error
    }
  }
}
