import { Inject, Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { Goal3FirestoreConfig } from '@/modules/firebase';
import {
  BETTING_HISTORY,
  CONFIG_COLL,
  EVENT_COLL,
  LEAGUE_COLL,
  SPACE_COLL,
  USER_COLL,
  USER_WAGER,
  WAGER_COLL,
} from '@/modules/firebase/constants';
import { IBookmakerConfigDB } from '@/modules/firebase/interfaces/database';
import Firestore = firestore.Firestore;
import { formatDate } from '@/modules/onesignal/util';
// import { SocialLoginDto, SocialType } from 'dtos/bookmaker/login.dto';

export interface UserData {
  invitation_code: string;
  isWhitelisted: boolean;
  smart_account: string;
  id: string;
  term_accepted: boolean;
  user_name: string;
  short_code: string;
  email?: string;
  picture?: string;
  created_at?: string;
}

@Injectable()
export class Goal3Firestore {
  @Inject('FIREBASE_FIRESTORE')
  private firestore: Firestore;

  @Inject('GOAL3_FIRESTORE_CONFIG')
  private goal3Config: Goal3FirestoreConfig;

  getEventDoc = (eventId: string) => {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.goal3Config.spaceId}/event/${eventId}`,
    );
  };

  getEventColl(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    return this.firestore.collection(
      `${SPACE_COLL}/${this.goal3Config.spaceId}/${EVENT_COLL}`,
    );
  }

  getConfigurationBookmakerDocRef() {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.goal3Config.spaceId}/configuration/bookmaker`,
    );
  }

  async getEvents(ids: string[]) {
    return this.getEventColl().where('id', 'in', ids).get();
  }

  async getBookmakerConfig() {
    const doc = await this.getConfigurationBookmakerDocRef().get();

    return doc.data();
  }

  async setBookmakerConfig(data: IBookmakerConfigDB) {
    const config = await this.getBookmakerConfig();
    if (config) {
      return await this.getConfigurationBookmakerDocRef().update({
        ...config,
        ...data,
      });
    } else {
      return await this.getConfigurationBookmakerDocRef().create({
        ...data,
      });
    }
  }

  onSnapshotBookmakerConfig(callback: any) {
    this.getConfigurationBookmakerDocRef().onSnapshot((snapshot) => {
      callback(snapshot.data());
    });
  }

  getEventMarketDocRef(eventId: string, market: string) {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.goal3Config.spaceId}/${EVENT_COLL}/${eventId}/markets/${market}`,
    );
  }

  getThresholdConfigDocRef() {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.goal3Config.spaceId}/${CONFIG_COLL}/threshold`,
    );
  }

  getLeagueDocRef(leagueId: string) {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.goal3Config.spaceId}/${LEAGUE_COLL}/${leagueId}`,
    );
  }

  getBookMakerConfigurationDoc() {
    return this.firestore.doc(
      `space/${this.goal3Config.spaceId}/${CONFIG_COLL}/bookmaker`,
    );
  }

  getUserByAddressDoc(address: string) {
    return this.firestore.doc(
      `space/${this.goal3Config.spaceId}/${USER_COLL}/${address}`,
    );
  }

  getUserCollRef() {
    return this.firestore.collection(
      `space/${this.goal3Config.spaceId}/${USER_COLL}`,
    );
  }

  getBettingHistoryColl(address: string) {
    return this.firestore.collection(
      `space/${this.goal3Config.spaceId}/${USER_COLL}/${address}/${BETTING_HISTORY}`,
    );
  }

  getWagerDocRef(wagerId: string) {
    return this.firestore.doc(
      `space/${this.goal3Config.spaceId}/${WAGER_COLL}/${wagerId}`,
    );
  }

  getUserWagerDoc(address: string, wagerId: string) {
    return this.firestore.doc(
      `space/${this.goal3Config.spaceId}/${USER_COLL}/${address}/${USER_WAGER}/${wagerId}`,
    );
  }

  // async countUserBySocial(socialId: string, socialType: SocialType) {
  //   const userRefs = this.firestore
  //     .collection(`space/${this.goal3Config.spaceId}/${USER_COLL}`)
  //     .where(`${socialType}`, '==', socialId);
  //   return await userRefs.count().get();
  // }

  // async getUserBySocial(data: SocialLoginDto) {
  //   const userRefs = this.firestore
  //     .collection(`space/${this.goal3Config.spaceId}/${USER_COLL}`)
  //     .where(`${data.socialType}`, '==', data.socialId);
  //   const users = await userRefs.get();
  //   return users.docs;
  // }

  async getWhitelist(): Promise<Array<string>> {
    const spaceDoc = this.firestore.doc(`space/${this.goal3Config.spaceId}`);
    const spaceData = await spaceDoc.get();
    return spaceData.data().whiteList as Array<string>;
  }

  async getUserByInviteCode(code: string) {
    const userRefs = this.firestore
      .collection(`space/${this.goal3Config.spaceId}/${USER_COLL}`)
      .where('short_code', '==', code);
    const users = await userRefs.get();
    return users.docs;
  }

  async getUserByPremiumCode(code: string) {
    const userRefs = this.firestore
      .collection(`space/${this.goal3Config.spaceId}/${USER_COLL}`)
      .where('premium_code', '==', code);
    const users = await userRefs.get();
    return users.docs;
  }

  async setUser(data: UserData) {
    const userDocRef = this.firestore.doc(
      `space/${this.goal3Config.spaceId}/${USER_COLL}/${data.id}`,
    );
    await userDocRef.set({ ...data }, { merge: true });
  }
  getUserBetHistoryDocRef(wallet: string, txhash: string) {
    return this.firestore.doc(
      `space/${this.goal3Config.spaceId}/user/${wallet}/betting_history/${txhash}`,
    );
  }

  getLeagueConfigDocRef() {
    return this.firestore.doc(
      `space/${this.goal3Config.spaceId}/configuration/leagueConfig`,
    );
  }

  async getUsersByTime(from: Date, to: Date) {
    const users = await this.firestore
      .collection(`space/${this.goal3Config.spaceId}/${USER_COLL}`)
      .where('created_at', '>=', from.toISOString().substring(0, 19) + 'Z')
      .where('created_at', '<=', to.toISOString().substring(0, 19) + 'Z')
      .get();
    return users.docs.map((user) => user.data());
  }

  async testConnection() {
    // const leagueIds = await this.firestore
    //   .collection(`space/${this.goal3Config.spaceId}/${LEAGUE_COLL}`)
    //   .get();
    // const leagueMap = {};
    // leagueIds.docs.map(async (lId) => {
    //   leagueMap[lId.id] = {
    //     name: lId.data().name,
    //     category_id: lId.data().category_id,
    //   };
    // });
    // console.log(
    //   '🚀 ~ file: goal3-firestore.ts:195 ~ Goal3Firestore ~ testConnection ~ leagueMap:',
    //   leagueMap,
    // );
    // return leagueMap;

    // const users = await this.firestore
    //   .collection(`space/${this.goal3Config.spaceId}/${USER_COLL}`)
    //   .orderBy('created_at', 'asc')
    //   .limit(2)
    //   .get();
    // console.log(
    //   '🚀 ~ file: goal3-firestore.ts:227 ~ Goal3Firestore ~ testConnection ~ users:',
    //   users.docs,
    // );
    // return users.docs.map((user) => user.data());

    const x = await this.firestore
      .collection(`space/${this.goal3Config.spaceId}/smc_transactions`)
      .where(
        'txhash',
        '==',
        '0x36c13b074abb2f5ee7ead16cd3a3a441dd85e17806f5ff11dbaa12e52a7906d9',
      )
      .get();
    console.log(
      '🚀 ~ file: goal3-firestore.ts:238 ~ Goal3Firestore ~ testConnection ~ x:',
      x.docs[0].data(),
    );

    // const _d = formatDate(
    //   new Date(new Date().setDate(new Date().getDate() - 30)),
    // );
    // const t = await this.firestore
    //   .collection(`space/${this.goal3Config.spaceId}/smc_transactions`)
    //   .where('contractName', '==', 'Wager')
    //   .where('eventName', '==', 'Redeem')
    //   // .orderBy('time', 'desc')
    //   // .where('time', '>=', `${_d}T23:59:59Z`)
    //   // .limit(2)
    //   .get();
    // const p = [];
    // for (const _m of t.docs) {
    //   const _y = new Set(_m.data().values.wagerIds);
    //   _y.delete('0x0000000000000000000000000000000000000000000000000000000000000000');
    //   const _x = _m
    //     .data()
    //     .values.wagerIds.filter(
    //       (_v) => _v !== '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     );
    //   if (_y.size !== _x.length) {
    //     p.push({
    //       t: String(_y.size) + '-' + _x.length,
    //       user: _m.data().values.user,
    //       id: _m.id,
    //     });
    //   }
    // }
    // console.log(
    //   '🚀 ~ file: goal3-firestore.ts:236 ~ Goal3Firestore ~ testConnection ~ t:',
    //   JSON.stringify(p),
    //   p.length,
    // );
  }
}
