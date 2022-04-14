import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import log from 'loglevel';
import * as anchor from '@project-serum/anchor';
import { CANDY_MACHINE_PROGRAM_V2_ID } from '../constants/constant';

export function loadSecretKey(file: string): Keypair {
  if (!file || file == '') {
    throw new Error('Keypair is required!');
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(file).toString()))
  );
  log.info(`[INFO] Wallet public key: ${loaded.publicKey}`);
  return loaded;
}

export async function loadCandyProgramV2(
  walletKeyPair: Keypair,
  env: string,
  customRpcUrl?: string
) {
  if (customRpcUrl) console.log('USING CUSTOM URL', customRpcUrl);

  // @ts-ignore
  const connection = new anchor.web3.Connection(
    //@ts-ignore
    customRpcUrl || getCluster(env)
  );

  const walletWrapper = new anchor.Wallet(walletKeyPair);
  const provider = new anchor.AnchorProvider(connection, walletWrapper, {
    preflightCommitment: 'recent',
  });
  const idl = await anchor.Program.fetchIdl(
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider
  );
  const program = new anchor.Program(
    idl!,
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider
  );
  log.debug('program id from anchor', program.programId.toBase58());
  return program;
}
