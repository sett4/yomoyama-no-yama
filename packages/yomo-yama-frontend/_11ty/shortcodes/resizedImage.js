import moduleName from '../helpers/moduleName.js';
import sharp from 'sharp';
import path from 'path';

const ASSETS_DIRECTORY = path.join(process.cwd(), 'assets');
const IMAGES_DIRECTORY = 'images';
const OUTPUT_PATH = path.join('_site', IMAGES_DIRECTORY);
const IMAGE_PREFIX = 'share_';

const body = (src, width, height) => {
  const imagePath = path.join(ASSETS_DIRECTORY, src);
  const imageName = IMAGE_PREFIX + path.parse(src).base;
  const outPath = path.join(OUTPUT_PATH, imageName);

  sharp(imagePath)
    .resize(width, height, {
      position: 'entropy',
    })
    .toFile(outPath);

  return path.join(IMAGES_DIRECTORY, imageName);
};

export default {
  name: moduleName(import.meta.url),
  body,
};
