import { Keypair } from '@solana/web3.js';
import { NFTStorageMetaplexor } from '@nftstorage/metaplex-auth';
import { NFTStorage, Blob } from 'nft.storage';
import log from 'loglevel';
import fs from 'fs';
import path from 'path';

export function nftStorageClient(
  walletKeyPair: Keypair,
  env: string,
  nftStorageKey: string | null
): NFTStorage | NFTStorageMetaplexor {
  return nftStorageKey
    ? new NFTStorage({ token: nftStorageKey })
    : NFTStorageMetaplexor.withSecretKey(walletKeyPair.secretKey, {
        solanaCluster: env,
        mintingAgent: 'metaplex/candy-machine-v2-cli',
      });
}

export function nftStorageManifestJson(manifestBuffer: Buffer) {
  return JSON.parse(manifestBuffer.toString('utf8'));
}

export async function nftStorageUploadMedia(
  client: NFTStorage | NFTStorageMetaplexor,
  media: string
) {
  try {
    const readStream = fs.createReadStream(media);
    log.info(`Media Upload ${media}`);
    // @ts-ignore - the Blob type expects a web ReadableStream, but also works with node Streams.
    const cid = await client.storeBlob({ stream: () => readStream });
    return `https://${cid}.ipfs.dweb.link`;
  } catch (err) {
    log.debug(err);
    throw new Error(`Media upload error: ${err}`);
  }
}

export async function nftStorageUploadMetadata(
  client: NFTStorage | NFTStorageMetaplexor,
  manifestJson: any
) {
  try {
    log.info('Upload metadata');
    const metaData = Buffer.from(JSON.stringify(manifestJson));
    const cid = await client.storeBlob(new Blob([metaData]));
    const link = `https://${cid}.ipfs.dweb.link`;
    log.info('Upload end');
    const imageUrl = manifestJson.image;
    const animationUrl = manifestJson.animation_url;
    if (animationUrl) {
      log.debug([link, imageUrl, animationUrl]);
    } else {
      log.debug([link, imageUrl]);
    }
    return [link, imageUrl, animationUrl];
  } catch (err) {
    log.debug(err);
    throw new Error(`Metadata upload error: ${err}`);
  }
}

export async function nftStorageUpload(
  image: string,
  animation: string | undefined,
  manifestBuffer: Buffer,
  client: NFTStorage | NFTStorageMetaplexor
) {
  // If we have an API token, use the default NFTStorage client.
  // Otherwise, use NFTStorageMetaplexor, which uses a signature
  // from the wallet key to authenticate.
  // See https://github.com/nftstorage/metaplex-auth for details.
  const manifestJson = nftStorageManifestJson(manifestBuffer);
  // Copied from ipfsUpload
  const imageUrl = `${await nftStorageUploadMedia(client, image)}?ext=${path
    .extname(image)
    .replace('.', '')}`;
  const animationUrl = animation
    ? `${await nftStorageUploadMedia(client, animation)}?ext=${path
        .extname(animation)
        .replace('.', '')}`
    : undefined;
  manifestJson.image = imageUrl;
  if (animation) {
    manifestJson.animation_url = animationUrl;
  }

  return nftStorageUploadMetadata(client, manifestJson);
}
