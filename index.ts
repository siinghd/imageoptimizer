import { Hono } from 'hono';
import { cors } from 'hono/cors'

import sharp from 'sharp';
import { htmlpage } from './constants';
import { createCanvas } from '@napi-rs/canvas';

interface QueryParams {
  url?: string;
  w?: string;
  h?: string;
  dpr?: string;
  fit?: 'inside' | 'outside' | 'cover' | 'fill' | 'contain';
  cbg?: string; // Contain background color
  we?: string; // Without enlargement
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
  q?: string; // Quality,
  txtColor?: string; // Text color
  fontSize?: string; // Font size
  fontFamily?: string; // Font family
  text?: string; // Text to render'
  textAlign?: 'left' | 'center' | 'right';
  roundedCorners?: boolean;
  cornerRadius?: number;
  textBaseline?:
    | 'top'
    | 'hanging'
    | 'middle'
    | 'alphabetic'
    | 'ideographic'
    | 'bottom';
}

interface Headers {
  'Content-Type': string;
  'Cache-Control': string;
  [key: string]: string;
}

const app = new Hono();
app.use('*', cors({
    origin: '*',  // Allow all origins
    allowMethods: '*',  // Allow all methods
    allowHeaders: '*',  // Allow all headers
    allowCredentials: true,  // Allow cookies and authorization headers
    maxAge: 86400,  // Cache preflight response for 1 day
}));

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
  const fitMap = {
    inside: sharp.fit.inside,
    outside: sharp.fit.outside,
    cover: sharp.fit.cover,
    fill: sharp.fit.fill,
    contain: sharp.fit.contain,
  };

  let fitOption: string = sharp.fit.inside;

  if (typeof params.fit === 'string' && fitMap[params.fit]) {
    fitOption = fitMap[params.fit];
  }

  const withoutEnlargement = params.we === 'true';

  let backgroundColor: sharp.Color = { r: 0, g: 0, b: 0, alpha: 0 };
  if (params.fit === 'contain' && params.cbg) {
    backgroundColor = parseColor(params.cbg);
  }

  if (width || height) {
    image = image.resize({
      width: width ? Math.round(width * pixelRatio) : undefined,
      height: height ? Math.round(height * pixelRatio) : undefined,
      withoutEnlargement: withoutEnlargement,
      background: backgroundColor,
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

const renderTextToImage = async (text: string, options: QueryParams) => {
  const width = parseInt(options.w || '800'); // Default width
  const height = parseInt(options.h || '800'); // Default height
  const backgroundColor = options.bg || 'white';
  const textColor = options.txtColor || 'black';
  const fontSize = options.fontSize || 48; // Default font size
  const fontFamily = options.fontFamily || 'Arial'; // Default font family
  const textAlign = options.textAlign || 'center'; // Default text alignment
  const roundedCorners = options.roundedCorners || false;
  const cornerRadius = options.cornerRadius || 20; // Default corner radius
  const textBaseline = options.textBaseline || 'middle';

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  if (roundedCorners) {
    context.beginPath();
    context.moveTo(cornerRadius, 0);
    context.arcTo(width, 0, width, height, cornerRadius);
    context.arcTo(width, height, 0, height, cornerRadius);
    context.arcTo(0, height, 0, 0, cornerRadius);
    context.arcTo(0, 0, width, 0, cornerRadius);
    context.closePath();
    context.clip();
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  context.fillStyle = textColor;
  context.font = `${fontSize}px ${fontFamily}`;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;

  const textY = height / 2;

  context.fillText(text, width / 2, textY);

  return canvas.toBuffer('image/png');
};

app.get('/', async (c) => {
  const queryParams = c.req.query() as QueryParams;
  const {
    text,
    url,
    default: defaultImg,
    filename,
    output,
    encoding,
  } = queryParams;

  if (!url) {
  }

  try {
    let baseImageBuffer;
    if (url) {
      let response = await fetchImage(url, defaultImg);
      baseImageBuffer = Buffer.from(await response.arrayBuffer());
      if (text) {
        // If text is also provided, overlay it onto the image
        const textOverlayParams = { ...queryParams, bg: 'transparent' };
        const textBuffer = await renderTextToImage(text, textOverlayParams);
        baseImageBuffer = await sharp(baseImageBuffer)
          .composite([{ input: textBuffer, blend: 'over' }])
          .toBuffer();
      }

      if (output === 'json') {
        const metadata = await fetchMetadata(baseImageBuffer);
        return c.json(metadata);
      }
    } else if (text) {
      baseImageBuffer = await renderTextToImage(text, queryParams);
    } else {
      return c.html(htmlpage);
    }

    let image = await processImage(baseImageBuffer!, queryParams);

    const headers: Headers = {
      'Content-Type': `image/${output || 'jpeg'}`,
      'Cache-Control': `max-age=${queryParams.maxage || '31536000'}`,
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
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
