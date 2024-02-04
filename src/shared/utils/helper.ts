import { BigNumber, ethers } from 'ethers';
import { PAGINATION_TAKEN } from '../constants/constants';

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

export function getOffset(take: number = PAGINATION_TAKEN, page?: number) {
  if (page && page > 0) {
    return take * page - take;
  }
  return 0;
}

export const genEventIdFromOutcomeId = (outcomeId: string): string => {
  return BigNumber.from(outcomeId).shr(64).toString();
};

export const formatWei6 = (amount: string) => {
  return ethers.utils.parseUnits(amount, WEI6).toString()
}

export const WEI6 = 6;