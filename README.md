# Image Processing Service

This service provides various image processing capabilities via a simple API.

## How to Use

Make a GET request to the service with the desired query parameters. For example:

```
https://images.hsingh.site/?url=<image_url>&w=300&h=200&q=75
```
## Support

If you find this service helpful, consider supporting the development:

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://paypal.me/hsiingh)

Thank you for your support!
## Query Parameters

- `url`:  The URL of the image to process.
- `w`: Width of the image in pixels. Default: Original image width.
- `h`: Height of the image in pixels. Default: Original image height.
- `dpr`: Device Pixel Ratio. Default: 1.
- `bg`: Background color in hex format (e.g., `#ffffff`). Default: None (transparent background).
- `blur`: Blur amount. Range: 0.3 to 1000. Default: No blur.
- `gam`: Gamma correction. Range: 1.0 to 3.0. Default: 2.2.
- `mod`: Modulate (brightness, saturation, hue) in the format `brightness,saturation,hue`. Default: `1,1,0`.
- `sharp`: Sharpen amount. Default: No sharpening.
- `encoding`: Encoding type. Supported: `base64`. Default: None.
- `maxage`: Cache-Control max age in seconds. Default: 31536000 (1 year).
- `l`: Compression level for PNG. Range: 0 to 9. Default: 6.
- `default`: Default image URL if the primary URL fails. Default: None.
- `filename`: Filename for the downloaded image. Default: None.
- `il`: Interlace for progressive images. Supported: `true`. Default: None.
- `n`: Number of pages (for multi-page formats). Default: 1. Use `-1` for all pages.
- `output`: Output format. Supported: `jpg`, `png`, `gif`, `tiff`, `webp`, `json`, `jpeg`. Default: `jpeg`.
- `page`: Specific page number (for multi-page formats). Default: 0 (first page).
- `q`: Quality of the image. Range: 1 to 100. Default: 80.

### Currently Not Supported (Coming in Future Updates)
- ~~`fit`: How the image should be resized.~~
- ~~`cbg`: Contain background color.~~
- ~~`we`: Without enlargement.~~
- ~~`a`: Alignment position.~~
- ~~`fpx`: Focal point X.~~
- ~~`fpy`: Focal point Y.~~
- ~~`crop`: Rectangle crop.~~
- ~~`trim`: Trim.~~
- ~~`mask`: Mask type.~~
- ~~`mtrim`: Mask trim.~~
- ~~`mbg`: Mask background.~~
- ~~`flip`: Flip the image vertically.~~
- ~~`flop`: Flop the image horizontally.~~
- ~~`ro`: Rotation.~~
- ~~`rbg`: Rotation background.~~
- ~~`con`: Contrast.~~
- ~~`filt`: Filter.~~
- ~~`sat`: Saturation level.~~
- ~~`hue`: Hue rotation.~~
- ~~`tint`: Tint.~~
- ~~`af`: Adaptive filter for PNG.~~

Default values are used if parameters are not specified.


