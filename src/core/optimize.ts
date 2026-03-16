import sharp from 'sharp';
import { CaptureResult, CaptureOptions } from './types.js';
import { debug } from '../utils/logger.js';

export async function optimizeCapture(
  result: CaptureResult,
  options: CaptureOptions = {}
): Promise<CaptureResult> {
  const maxDim = options.maxDimension ?? 1280;
  const quality = options.quality ?? 80;

  try {
    const metadata = await sharp(result.image).metadata();

    const optimized = await sharp(result.image)
      .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    return {
      ...result,
      image: optimized,
      format: 'jpeg',
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  } catch (err) {
    debug('Image optimization failed, returning raw:', err);
    return result;
  }
}
