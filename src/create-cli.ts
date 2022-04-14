import { program } from 'commander';
import log from 'loglevel';
import { web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';
import { createMetadata, validateMetadata } from './metadata/fungibleToken';
import { createMetadataAccount } from './metadata/accounts';
import { loadSecretKey } from './utils/loader';

program.version('1.1.0');
log.setLevel('info');

function programCommand(name: string) {
  return program
    .command(name)
    .option(
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet' //mainnet-beta, testnet, devnet
    )
    .option(
      '-k, --keypair <path>',
      `Solana wallet location`,
      '--keypair not provided'
    )
    .option('-l, --log-level <string>', 'log level', setLogLevel);
}

programCommand('create-metadata')
  .requiredOption('-m, --mint <string>', 'base58 mint key')
  .option('-u, --uri <string>', 'metadata uri')
  .option('-f, --file <string>', 'local file')
  .option(
    '-nvc, --no-verify-creators',
    'Optional: Disable Verification of Creators'
  )
  .action(async (directory, cmd) => {
    const { keypair, env, mint, uri, file, verifyCreators } = cmd.opts();
    const mintKey = new PublicKey(mint);
    const connection = new web3.Connection(web3.clusterApiUrl(env));
    const walletKeypair = loadSecretKey(keypair);

    let data: DataV2 | undefined;
    if (uri) {
      data = await createMetadata(uri, verifyCreators);
      if (!data) {
        log.error('No metadata found at URI.');
        return;
      }
    } else if (file) {
      const fileData = JSON.parse(fs.readFileSync(file).toString());
      log.info('Read from file', fileData);
      data = validateMetadata({ metadata: fileData, uri: '' });
    } else {
      log.error('No metadata source provided.');
      return;
    }

    if (!data) {
      log.error('Metadata not constructed.');
      return;
    }

    await createMetadataAccount({
      connection,
      data,
      mintKey,
      walletKeypair,
    });
  });

function setLogLevel(value: any, prev: any) {
  if (value === undefined || value === null) {
    return;
  }
  log.info('setting the log value to: ' + value);
  log.setLevel(value);
}

program.parse(process.argv);
