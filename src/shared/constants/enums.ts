export enum ENotificationStatus {
  Pending = 'pending',
  Sent = 'sent',
  Error = 'error',
  Clicked = 'clicked',
  Read = 'read',
}

export enum EOrderStatus {
  Placed = 'PLACED',
  Filled = 'FILLED',
  Burned = 'BURNED',
  Closed = 'CLOSED',
  Cancel = 'CANCEL',
}

export enum EPriceRange {
  R_5ME = '5ME',
  R_1D = '1D',
  R_7D = '7D',
  R_1M = '1M',
  R_1Y = '1Y',
}

export enum EAIModel {
  GPT4_1106 = 'gpt-4-1106-preview',
  GPT4_TURBO_2024_04_09 = 'gpt-4-turbo-2024-04-09',
  GPT3_5_TURBO_0125 = 'gpt-3.5-turbo-0125',
}
