import { Hono } from 'hono';
import sharp from 'sharp';
import { htmlpage } from './constants';

interface QueryParams {
  url?: string;
  w?: string;
  h?: string;
  dpr?: string;
  fit?: 'inside' | 'outside' | 'cover' | 'fill' | 'contain';
  //   cbg?: string; // Contain background color
  //   we?: string; // Without enlargement
  //   a?: string; // Alignment position
  //   fpx?: string; // Focal point X
  //   fpy?: string; // Focal point Y
  //   crop?: string; // Rectangle crop
  //   trim?: string; // Trim
  //   mask?: string; // Mask type
  //   mtrim?: string; // Mask trim
  //   mbg?: string; // Mask background
  //   flip?: string;
  //   flop?: string;
  //   ro?: string; // Rotation
  //   rbg?: string; // Rotation background
  bg?: string; // Background
  blur?: string;
  //   con?: string; // Contrast
  //   filt?: string; // Filter
  gam?: string; // Gamma
  mod?: string; // Modulate
  //   sat?: string; // Saturation
  //   hue?: string; // Hue rotation
  sharp?: string; // Sharpen
  tint?: string; // Tint
  //   af?: string; // Adaptive filter
  encoding?: 'base64';
  maxage?: string; // Cache-Control
  l?: string; // Compression level
  default?: string; // Default image
  filename?: string;
  il?: string; // Interlace / progressive
  n?: string; // Number of pages
  output?: 'jpg' | 'png' | 'gif' | 'tiff' | 'webp' | 'json' | 'jpeg';
  page?: string;
  q?: string; // Quality
}

interface Headers {
  'Content-Type': string;
  'Cache-Control': string;
  [key: string]: string;
}

const app = new Hono();

const fetchImage = async (url: string, defaultImg?: string) => {
  let response = await fetch(url);
  if (!response.ok && defaultImg) {
    response = await fetch(decodeURIComponent(defaultImg));
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response;
};
const parseColor = (color: string): sharp.Color => {
  // Regular expressions for different color formats
  const hex3 = /^#([0-9a-f]{3})$/i;
  const hex4 = /^#([0-9a-f]{4})$/i;
  const hex6 = /^#([0-9a-f]{6})$/i;
  const hex8 = /^#([0-9a-f]{8})$/i;

  // Convert 3 and 4 digit hex to 6 and 8 digit hex (e.g., #RGB to #RRGGBB)
  if (hex3.test(color) || hex4.test(color)) {
    color = color
      .replace(/^#/, '')
      .split('')
      .map((c) => c + c)
      .join('');
    color = '#' + color;
  }

  // Validate and return the color if it matches the 6 or 8 digit hex pattern
  if (hex6.test(color) || hex8.test(color)) {
    return color;
  }

  // Add more conditions here if you're accepting other formats

  // Default or error handling
  // You might want to throw an error or return a default color if the format is unrecognized
  return color;
};
const fetchMetadata = async (buffer: Buffer): Promise<sharp.Metadata> => {
  const image = sharp(buffer);
  return image.metadata();
};
const processImage = async (
  buffer: Buffer,
  params: QueryParams
): Promise<sharp.Sharp | string> => {
  let image = sharp(buffer, { pages: params.n === '-1' ? -1 : undefined });
  if (params.page) {
    image = sharp(buffer, { page: parseInt(params.page) });
  }
  const width = params.w ? parseInt(params.w, 10) : null;
  const height = params.h ? parseInt(params.h, 10) : null;
  const pixelRatio = params.dpr ? parseFloat(params.dpr) : 1;
  if (width || height) {
    image = image.resize({
      width: width ? Math.round(width * pixelRatio) : undefined,
      height: height ? Math.round(height * pixelRatio) : undefined,
    });
  }

  const quality = Math.min(
    Math.max(params.q ? parseInt(params.q, 10) : 80, 1),
    100
  );
  if (params.output) {
    switch (params.output) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ progressive: params.il === 'true', quality });
        break;
      case 'png':
        image = image.png({
          compressionLevel: params.l ? parseInt(params.l, 10) : 6,
        });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'tiff':
        image = image.tiff({ compression: 'lzw', quality });
        break;
      case 'gif':
        // Note: only tge first page of a gif is returned
        image = image.gif();
        break;
      default:
        image = image.jpeg({ quality });
    }
  } else {
    image = image.jpeg({ quality });
  }
  if (params.bg) {
    const bgColor = parseColor(params.bg);
    image = image.flatten({ background: bgColor });
  }
  if (params.blur) {
    const blurAmount = parseFloat(params.blur);
    image = image.blur(
      blurAmount >= 0.3 && blurAmount <= 1000 ? blurAmount : undefined
    );
  }

  if (params.gam) {
    const gammaValue = parseFloat(params.gam);
    image = image.gamma(
      gammaValue >= 1.0 && gammaValue <= 3.0 ? gammaValue : 2.2
    );
  }

  if (params.mod) {
    const [brightness, saturation, hue] = params.mod.split(',').map(parseFloat);
    image = image.modulate({
      brightness: brightness || 1,
      saturation: saturation || 1,
      hue: hue || 0,
    });
  }

  if (params.sharp) {
    const sharpenAmount = parseInt(params.sharp, 10);
    image = image.sharpen({ sigma: sharpenAmount });
  }
  if (params.encoding === 'base64') {
    return image.toBuffer().then((buffer) => buffer.toString('base64'));
  }
  return image;
};

app.get('/', async (c) => {
  const queryParams = c.req.query() as QueryParams;
  const { url, default: defaultImg, filename, output, encoding } = queryParams;

  if (!url) {
    return c.html(htmlpage);
  }

  try {
    let response = await fetchImage(url, defaultImg);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (output === 'json') {
      const metadata = await fetchMetadata(buffer);
      return c.json(metadata);
    } else {
      let image = await processImage(buffer, queryParams);

      const headers: Headers = {
        'Content-Type': `image/${output || 'jpeg'}`,
        'Cache-Control': `max-age=${queryParams.maxage || '31536000'}`,
      };

      if (filename) {
        headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      }

      if (typeof image === 'string') {
        // Return Base64 encoded image
        return c.json({
          data: `data:image/${output || 'jpeg'};base64,${image}`,
        });
      }
      const processedImage = await image.toBuffer();
      return new Response(processedImage, { headers });
    }
  } catch (error) {
    console.error(error);
    return c.json(
      { error: 'An error occurred while processing the image.' },
      500
    );
  }
});

app.notFound((c) => c.text('Custom 404 Message', 404));
app.onError((err, c) => c.text('Custom Error Message', 500));

// const bunInstanceId = parseInt((Bun.env.NODE_APP_INSTANCE || 0).toString());
// const basePort = parseInt((Bun.env.PORT || 0).toString());
// const PORT = basePort + bunInstanceId;
export default {
  port: process.env.PORT || 3010,
  fetch: app.fetch,
};
