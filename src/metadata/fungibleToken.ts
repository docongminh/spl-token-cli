import log from 'loglevel';
import { PublicKey } from '@solana/web3.js';
import { DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import fetch from 'node-fetch';

export const createMetadata = async (
  metadataLink: string,
  verifyCreators: boolean,
  collection?: PublicKey
): Promise<DataV2 | undefined> => {
  // Metadata
  let metadata;
  try {
    metadata = await (await fetch(metadataLink, { method: 'GET' })).json();
  } catch (e) {
    log.debug(e);
    log.error('Invalid metadata at', metadataLink);
    return;
  }

  return validateMetadata({
    metadata,
    uri: '',
    verifyCreators,
    collection,
  });
};

// Validate metadata
export const validateMetadata = ({
  metadata,
  uri,
}: {
  metadata: any;
  uri: string;
  verifyCreators?: boolean;
  collection?: PublicKey;
}): DataV2 | undefined => {
  if (
    !metadata.name ||
    !metadata.image ||
    isNaN(metadata.seller_fee_basis_points) ||
    !metadata.properties
  ) {
    log.error('Invalid metadata file', metadata);
    return;
  }

  return new DataV2({
    symbol: metadata.symbol,
    name: metadata.name,
    uri,
    sellerFeeBasisPoints: metadata.seller_fee_basis_points,
    creators: null,
    collection: null,
    uses: null,
  });
};
