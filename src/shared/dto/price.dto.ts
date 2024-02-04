export enum ESocketMethod {
  SUB = 'sub',
  UNSUB = 'unsub',
}

export enum ESocketType {
  PRICE = 'price',
  ORDER = 'order',
  USER = 'user',
}

export type TPriceSocket = {
  method: ESocketMethod;
  type: ESocketType;
  params: { token?: string; access_token?: string };
};
