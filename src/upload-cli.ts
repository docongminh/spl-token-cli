import { program } from 'commander';
import log from 'loglevel';
import * as path from 'path';
import { URL } from 'url';
import {
  nftStorageClient,
  nftStorageManifestJson,
  nftStorageUploadMetadata,
} from './upload/nftStorage';
import { loadSecretKey } from './utils/loader';
import { getAssetManifest } from './upload/utils';
import { StorageType } from './types';

program.version('1.1.0');
log.setLevel('info');

programCommand('upload-metadata-to-storage')
  .requiredOption('-f, --file <string>', 'metadata json file')
  .requiredOption('-s, --storage <string>', 'storage type')
  .option('-r, --rpc-url <string>', 'Optional: Custom RPC url')
  .option('--nft-storage-key <string>', 'Optional: NFT storage key')
  .option('--ipfs-credentials <string>', 'Optional: IPFS credentials')
  .option('--pinata-jwt <string>', 'Optional: Pinata JWT')
  .option('--pinata-gateway <string>', 'Optional: Pinata Gateway')
  .option('--aws-s3-bucket <string>', 'Optional: AWS S3 Bucket')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { keypair, env, file, storage, nftStorageKey } = cmd.opts();
    const walletKeypair = loadSecretKey(keypair);

    const { dir: dirname, name: index } = path.parse(file);
    const asset = { index };
    const manifest = getAssetManifest(
      dirname,
      asset.index.includes('json') ? asset.index : `${asset.index}.json`
    );

    const { image, animation_url } = manifest;
    const manifestBuffer = Buffer.from(JSON.stringify(manifest));
    const validUrl = (url: any) => {
      try {
        new URL(url);
        return true;
      } catch (err: any) {
        log.error('Invalid url:', err.message);
        return false;
      }
    };

    if (!image || !validUrl(image)) {
      throw new Error(`Invalid image specified in ${asset.index}.json`);
    }
    if (animation_url && !validUrl(animation_url)) {
      throw new Error(`Invalid animation_url specified in ${asset.index}.json`);
    }

    let link, imageLink, animationLink;
    try {
      switch (storage) {
        case StorageType.NftStorage: {
          const client = nftStorageClient(walletKeypair, env, nftStorageKey);
          const manifestJson = nftStorageManifestJson(manifestBuffer);
          [link, imageLink, animationLink] = await nftStorageUploadMetadata(
            client,
            manifestJson
          );
          break;
        }
        default:
          throw new Error('Not implemented');
      }
      if (link) {
        log.info('Upload complete:', { link, imageLink, animationLink });
      }
    } catch (err: any) {
      log.error('Error uploading:', err.toString());
    }
  });

function programCommand(name: string) {
  return program
    .command(name)
    .option(
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet' //mainnet-beta, testnet, devnet
    )
    .requiredOption('-k, --keypair <path>', 'Solana wallet location')
    .option('-l, --log-level <string>', 'log level', setLogLevel);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setLogLevel(value: any, prev: any) {
  if (value === undefined || value === null) {
    return;
  }
  log.info('setting the log value to: ' + value);
  log.setLevel(value);
}

program.parse(process.argv);
