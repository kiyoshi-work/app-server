import { BigNumber, ethers } from 'ethers';
import Decimal from 'decimal.js';
import { PAGINATION_TAKEN } from '../pagination/constants';

export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const chunked = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunked.push(array.slice(i, i + chunkSize));
  }

  return chunked;
}

export const validateEtherAddress = (address: string) => {
  return /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
};

export const validateDate = (date: string | number | Date) => {
  return !isNaN(new Date(date).getDate());
};

export const genEventIdFromOutcomeId = (outcomeId: string): string => {
  return BigNumber.from(outcomeId).shr(64).toString();
};

export const formatWei6 = (amount: string) => {
  return ethers.utils.parseUnits(amount, WEI6).toString()
}

export const WEI6 = 6;

export const toNumber = (a: number | string, precision = 9) => {
  const DecimalPrecision = Decimal.clone({ precision: precision });

  return new DecimalPrecision(a)
    .toNearest(1 / 10 ** precision, Decimal.ROUND_DOWN)
    .toNumber();
};
