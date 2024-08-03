import { Program } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { Supercharged } from './sdk/idl/supercharged';

export const getEventPda = (
  program: Program<Supercharged>,
  eventId: anchor.BN,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('event'), eventId.toArrayLike(Buffer, 'le', 8)],
    program.programId,
  )[0];
};

export const getProgramBalancePda = (
  program: Program<Supercharged>,
  outcomeId: anchor.BN,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('program-balance'), outcomeId.toArrayLike(Buffer, 'le', 8)],
    program.programId,
  )[0];
};

export const getOutcomePda = (
  program: Program<Supercharged>,
  outcomeId: anchor.BN,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('outcome'), outcomeId.toArrayLike(Buffer, 'le', 8)],
    program.programId,
  )[0];
};

export const getAdminPda = (
  program: Program<Supercharged>,
  admin: anchor.web3.PublicKey,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('administrator'), admin.toBuffer()],
    program.programId,
  )[0];
};

export const getOrderPda = (
  program: Program<Supercharged>,
  orderId: anchor.BN,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('order'), orderId.toArrayLike(Buffer, 'le', 8)],
    program.programId,
  )[0];
};

export const getUserBalancePda = (
  program: Program<Supercharged>,
  user: anchor.web3.PublicKey,
  outcomeId: anchor.BN,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('balance'),
      user.toBuffer(),
      outcomeId.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId,
  )[0];
};

export const getConfigPda = (program: Program<Supercharged>) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program.programId,
  )[0];
};

export const getVaultAuthorityPda = (program: Program<Supercharged>) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority')],
    program.programId,
  )[0];
};

export const getTotalClaimPda = (
  program: Program<Supercharged>,
  user: anchor.web3.PublicKey,
  outcomeId: anchor.BN,
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('total_claim'),
      user.toBuffer(),
      outcomeId.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId,
  )[0];
};

export const getTokenSupportPda = (program: Program<Supercharged>) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('token_support')],
    program.programId,
  )[0];
};
