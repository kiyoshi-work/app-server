import { Inject, Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { AppFirestoreConfig } from '@/modules/firebase';
import {
  EVENT_COLL,
  LEAGUE_COLL,
  SPACE_COLL,
  USER_COLL,
} from '@/modules/firebase/constants';
import Firestore = firestore.Firestore;
import axios from 'axios';

@Injectable()
export class AppFirestoreRepository {
  @Inject('FIREBASE_FIRESTORE')
  private firestore: Firestore;

  @Inject('APP_FIRESTORE_CONFIG')
  private appFirestoreConfig: AppFirestoreConfig;

  getEventDoc = (eventId: string) => {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.appFirestoreConfig.spaceId}/event/${eventId}`,
    );
  };

  getEventColl(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    return this.firestore.collection(
      `${SPACE_COLL}/${this.appFirestoreConfig.spaceId}/${EVENT_COLL}`,
    );
  }

  getLeagueDocRef(leagueId: string) {
    return this.firestore.doc(
      `${SPACE_COLL}/${this.appFirestoreConfig.spaceId}/${LEAGUE_COLL}/${leagueId}`,
    );
  }
  getUserByAddressDoc(address: string) {
    return this.firestore.doc(
      `space/${this.appFirestoreConfig.spaceId}/${USER_COLL}/${address}`,
    );
  }

  getUserCollRef() {
    return this.firestore.collection(
      `space/${this.appFirestoreConfig.spaceId}/${USER_COLL}`,
    );
  }

  async getUsersByTime(from: Date, to: Date) {
    const users = await this.firestore
      .collection(`space/${this.appFirestoreConfig.spaceId}/${USER_COLL}`)
      .where('created_at', '>=', from.toISOString().substring(0, 19) + 'Z')
      .where('created_at', '<=', to.toISOString().substring(0, 19) + 'Z')
      .get();
    return users.docs.map((user) => user.data());
  }

  async testConnection() {
    const users = await this.firestore
      .collection(`space/${this.appFirestoreConfig.spaceId}/${USER_COLL}`)
      .orderBy('created_at', 'asc')
      .limit(2)
      .get();
    console.log(
      '🚀 ~ file: app-firestore.repository.ts:67 ~ AppFirestoreRepository ~ testConnection ~ users.docs:',
      users.docs.map((user) => user.data()),
    );
    return users.docs.map((user) => user.data());
  }

  async test() {
    const outcomeId = '138007913835604830448075388';
    const eventId = '7481424';
    let marketId;
    let oddId;
    const event = await this.firestore
      .doc(`space/${this.appFirestoreConfig.spaceId}/${EVENT_COLL}/${eventId}`)
      .get();
    const eventData = event.data();
    for (const market of Object.values(eventData.markets || {}).flat()) {
      const marketData = market as any;
      marketData.odds.forEach((odd) => {
        if (odd.outcome_id) {
          if (odd.outcome_id == outcomeId) {
            oddId = odd.id;
            marketId = marketData.id;
          }
        }
      });
    }
  }
}
