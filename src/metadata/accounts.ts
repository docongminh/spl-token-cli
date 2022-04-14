import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import {
  DataV2,
  CreateMetadataV2,
} from '@metaplex-foundation/mpl-token-metadata';

import { sendTransactionWithRetryWithKeypair } from '../transaction/sendTransaction';
import { getMetadata } from './utils';

export const createMetadataAccount = async ({
  connection,
  data,
  mintKey,
  walletKeypair,
}: {
  connection: Connection;
  data: DataV2;
  mintKey: PublicKey;
  walletKeypair: Keypair;
}): Promise<PublicKey | void> => {
  // Retrieve metadata
  const metadataAccount = await getMetadata(mintKey);
  const signers: anchor.web3.Keypair[] = [];
  const wallet = new anchor.Wallet(walletKeypair);
  if (!wallet?.publicKey) return;

  const instructions = new CreateMetadataV2(
    { feePayer: wallet.publicKey },
    {
      metadata: metadataAccount,
      metadataData: data,
      updateAuthority: wallet.publicKey,
      mint: mintKey,
      mintAuthority: wallet.publicKey,
    }
  ).instructions;

  // Execute transaction
  const txid = await sendTransactionWithRetryWithKeypair(
    connection,
    walletKeypair,
    instructions,
    signers
  );
  console.log('Metadata created', txid);
  return metadataAccount;
};
