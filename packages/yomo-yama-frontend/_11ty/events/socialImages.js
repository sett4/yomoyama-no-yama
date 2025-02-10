import fs from 'fs';
import path from 'path';
import Image from '@11ty/eleventy-img';
import siteConfig from '../../content/_data/siteConfig.js';

const SOCIAL_PREVIEW_IMAGES_DIR = path.join('_site', 'images', 'share');
const OUTPUT_IMAGE_EXTENSION = 'jpg';

export default () => {
  const files = fs.readdirSync(SOCIAL_PREVIEW_IMAGES_DIR);

  if (siteConfig.opengraph.enableImageGeneration) {
    if (files && files.length > 0) {
      files.forEach(async (filename) => {
        if (filename.endsWith('.svg')) {
          const imageUrl = path.join(SOCIAL_PREVIEW_IMAGES_DIR, filename);

          await Image(imageUrl, {
            formats: ['jpeg'],
            outputDir: path.join('.', SOCIAL_PREVIEW_IMAGES_DIR),
            filenameFormat: () => {
              const outputFilename = filename.substring(0, filename.length - 4);

              return `${outputFilename}.${OUTPUT_IMAGE_EXTENSION}`;
            },
          });

          // we no longer need SVG files after converting to JPG so we remove them

          // fs.unlinkSync(imageUrl);
        }
      });
    }
  } else {
    // If OG image generation is off, SVG files are not needed,
    // so we remove them from the build
    fs.rmSync(SOCIAL_PREVIEW_IMAGES_DIR, { recursive: true, force: true });
  }
};
