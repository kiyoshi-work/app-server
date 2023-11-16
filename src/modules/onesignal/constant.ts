export const DEFAULT_VALUE_TAG = '1';
export const MAX_EXTERNAL_IDS_SEND_NOTIFICATION = 1000;
export const MAX_BATCH_INSERT = 3000;

export function getAppId() {
  return process.env.ONESIGNAL_APP_ID;
}
