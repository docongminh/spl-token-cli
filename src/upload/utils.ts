import type { Manifest } from '../types';
import path from 'path';
import fs from 'fs';

/**
 * Returns a Manifest from a path and an assetKey
 * Replaces image.ext => index.ext
 * Replaces animation_url.ext => index.ext
 */
export function getAssetManifest(dirname: string, assetKey: string): Manifest {
  const assetIndex = assetKey.includes('.json')
    ? assetKey.substring(0, assetKey.length - 5)
    : assetKey;
  const manifestPath = path.join(dirname, `${assetIndex}.json`);
  const manifest: Manifest = JSON.parse(
    fs.readFileSync(manifestPath).toString()
  );
  manifest.image = manifest.image.replace('image', assetIndex);

  if ('animation_url' in manifest) {
    manifest.animation_url = manifest.animation_url.replace(
      'animation_url',
      assetIndex
    );
  }
  return manifest;
}
