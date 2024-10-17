import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import WebSocket from 'ws';
import zlib from 'zlib';
import { GCPubSubService } from '@/transporter/services/google-pubsub.service';

@Injectable()
export class BingXPriceService implements OnApplicationBootstrap {
  private _socket: WebSocket;
  private _pairSocketUrl = 'wss://ws-spot.we-api.com/market';

  private _subscribe() {
    if (this._socket) {
      this._socket.send(
        JSON.stringify({
          dataType: 'spot.depth2.AITECH_USDT.0.00001',
          data: {
            depth: 5,
            aggPrecision: '0.00001',
          },
          id: '3c062bfa-a0d0-49fe-a8ab-e46889a77ee0',
          reqType: 'sub',
        }),
      );
    }
  }

  private async _loadPair() {
    if (!this._socket || this._socket.readyState !== WebSocket.OPEN) {
      this._socket?.close();
      console.log('CREATE NEW SOCKET CONNECTION');
      this._socket = new WebSocket(this._pairSocketUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
          Origin: 'https://bingx.com',
        },
      });
      this._socket.on('open', () => this._subscribe());
      this._socket.on('error', (error) =>
        console.log('WebSocket error:', error),
      );
      this._socket.on('message', async (_payload: any) => {
        const buf = Buffer.from(_payload);
        const decodedMsg = zlib.gunzipSync(buf).toString('utf-8');
        if (decodedMsg === 'Ping') {
          this._socket.send('Pong');
          console.log('Pong');
        } else {
          let _decodedMsg = JSON.parse(decodedMsg);
          console.log(
            '🚀 ~ file: test.service.ts:41 ~ TestService ~ this._socket.on ~ _payload:',
            _decodedMsg,
          );
          this.gCPubSubService.emitEvent('new-top-askbid', {
            asks: _decodedMsg?.data?.asks,
            bids: _decodedMsg?.data?.bids,
            symbol: 'AITECH',
          });
        }
      });
      this._socket.on('close', () => {
        console.log('WebSocket closed');
        setTimeout(() => {
          this._loadPair();
        }, 1000);
      });
    } else {
      this._subscribe();
    }
  }
  // @Interval(1000 * 60 * 60)
  async reloadSocket() {
    console.log('====== RELOAD SOCKET=====');
    this._socket.terminate();
    this._socket = undefined;
    await this._loadPair();
  }

  private initialize = async () => {
    await this._loadPair();
  };
  async onApplicationBootstrap() {
    // await this.initialize();
  }

  constructor(private readonly gCPubSubService: GCPubSubService) {}
}
