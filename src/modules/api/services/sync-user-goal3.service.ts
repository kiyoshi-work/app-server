import { Inject, Injectable } from '@nestjs/common';
import {
  AdminConfigRepository,
  ClientRepository,
  UserRepository,
} from '@/database/repositories';
import { Goal3Firestore } from '@/modules/firebase';
import { validateDate, validateEtherAddress } from '@/shared/utils';
import { Cron, CronExpression } from '@nestjs/schedule';

interface IUserFireStore {
  id: string;
  username?: string;
  created_at?: Date | string | number;
  profile_image_url?: string;
}

const isRunSchedule = Boolean(Number(process.env.IS_SCHEDULER || 0));
@Injectable()
export class SyncUserGoal3Service {
  @Inject('GOAL3_FIRESTORE')
  private goal3Firestore: Goal3Firestore;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly clientRepository: ClientRepository,
    private readonly adminConfigRepository: AdminConfigRepository,
  ) {}
  async onApplicationBootstrap() {
    if (isRunSchedule) {
      await this.initialize();
    }
  }

  private _fromTime: Date;
  private _clientId: string;

  private initialize = async () => {
    this._clientId = 'cd3a5797-737c-4375-be6f-549caa49bc8d';
    if (
      !(await this.clientRepository.exist({ where: { id: this._clientId } }))
    ) {
      await this.clientRepository.save({ id: this._clientId, name: 'Goal3' });
    }
    const lastUser = await this.userRepository.getLastUserCreated(
      this._clientId,
    );
    console.log(
      '🚀 ~ file: sync-user-goal3.service.ts:34 ~ SyncUserGoal3Service ~ initialize= ~ lastUser:',
      lastUser,
    );
    this._fromTime = new Date(lastUser?.created_at || '2023-03-25');
    // await this._syncUser(this._fromTime, new Date());
    await this._updateUserSnapshot(this._fromTime);
  };

  private async _updateUserSnapshot(from: Date) {
    const userCollectionRef = this.goal3Firestore.getUserCollRef();
    userCollectionRef
      .where('created_at', '>=', from.toISOString().substring(0, 19) + 'Z')
      .onSnapshot((snapshot) => {
        snapshot.forEach(async (change) => {
          // if (change.type === 'added') {
          const newUser = change.data() as IUserFireStore;
          console.log('🚀 ~ UPDATED GOAL3 USER', newUser?.id);
          await this._saveUser([newUser]);
          // }
        });
      });
  }

  private async _saveUser(data: IUserFireStore[]) {
    try {
      const saveUsers = data
        .filter(
          (user) =>
            user &&
            user.id &&
            validateEtherAddress(user.id) &&
            validateDate(user.created_at),
        )
        .map((user) => ({
          client_uid: user.id,
          client_id: this._clientId,
          username: user.username,
          created_at: user.created_at ? new Date(user.created_at) : new Date(),
          metadata: {
            profile_image_url: user.profile_image_url,
          },
        }));
      if (saveUsers && saveUsers.length) {
        await this.userRepository.upsert(saveUsers, {
          conflictPaths: ['client_id', 'client_uid'],
        });
      }
    } catch (error) {
      console.log('🚀 ~ save to db fail:', error.message);
    }
  }

  private async _syncUser(from: Date, to: Date) {
    while (from <= to) {
      const _st = new Date().getTime();
      const end = new Date(from);
      const duration = 24 * 60 * 60 * 1000;
      end.setTime(end.getTime() + duration);
      console.log(
        '🚀 ~ file: 001_create_order_outcomes.ts:13 ~ seed ~ day:',
        end,
      );
      const users = (await this.goal3Firestore.getUsersByTime(
        new Date(from),
        end,
      )) as any;
      console.log(
        '🚀 ~ file: sync-user-goal3.service.ts:41 ~ SyncUserGoal3Service ~ _syncUser ~ users:',
        users.length,
      );
      await this._saveUser(users);
      from.setTime(from.getTime() + duration);
      const _ed = new Date().getTime();
      console.log(`TIME: ${_ed - _st}`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async runSyncUser() {
    if (!isRunSchedule) return;
    console.log(
      '🚀 ~ file: sync-user-goal3.service.ts:128 ~ SyncUserGoal3Service ~ runSyncUser ~ runSyncUser:',
    );
    const config = await this.adminConfigRepository.findOneBy({
      key: 'update_share_price',
    });
    if (config.value == 'start') {
      await this.adminConfigRepository.save({
        ...config,
        value: 'end',
      });
      await this._syncUser(
        new Date(config?.data?.from || new Date()),
        new Date(config?.data?.to || new Date()),
      );
    }
  }
}
