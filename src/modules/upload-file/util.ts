import { fromBuffer } from 'file-type';

export const imageExtension = new Set([
  'jpg',
  'png',
  'gif',
  'webp',
  'flif',
  'cr2',
  'tif',
  'bmp',
  'jxr',
  'psd',
  'ico',
  'bpg',
  'jp2',
  'jpm',
  'jpx',
  'heic',
  'cur',
  'dcm',
]);
export async function imageType(input: Buffer): Promise<string> {
  const ret = await fromBuffer(input);
  return imageExtension.has(ret?.ext) ? ret.ext : 'jpg';
}
