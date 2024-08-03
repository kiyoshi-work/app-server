import { parseWei6 } from '@/shared/utils';

export enum EEventName {
  CREATE_EVENT = 'eventCreated',
  CREATE_ORDER_EVENT = 'createOrderEvent',
  CANCEL_ORDER_EVENT = 'closeOrderEvent',
  MATCHING_ORDER_EVENT = 'matchOrderEvent',
  RESOLVE_EVENT = 'eventResolved',
  CLAIM_EVENT = 'claimEventEvent',
}
export const parseCreateEvent = (events: any[]) => {
  return events
    .filter((event) => event?.name === EEventName.CREATE_EVENT)
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        event_id: data.eventId.toNumber(),
        outcome_id: data.outcomeId.toNumber(),
        start_time: new Date(data.startTime.toNumber()),
        end_time: new Date(data.endTime.toNumber()),
        time: new Date(event.blockTime),
        txhash: event.signature,
      };
    });
};

export const parseCreateBuyOrder = (events: any[]) => {
  return events
    .filter((event) => event?.name === EEventName.CREATE_ORDER_EVENT)
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        outcome_id: data.outcomeId.toNumber(),
        order_id: data.orderId.toNumber(),
        price: parseWei6(data.price),
        value: parseWei6(data.value),
        amount: parseWei6(data.amount),
        order_type: data.orderType,
        time: new Date(event.blockTime),
        txhash: event.signature,
      };
    });
};
