export const htmlpage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Processing Service</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        h1, h2 {
            color: #444;
        }
        pre {
            background-color: #eee;
            padding: 10px;
            border-left: 3px solid #333;
            overflow: auto;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        ul li {
            background-color: #fff;
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        code {
            background-color: #eee;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        a {
            color: #0275d8;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>Image Processing Service</h1>
    <p>This service provides various image processing capabilities via a simple API.</p>
    
    <h2>How to Use</h2>
    <p>Make a GET request to the service with the desired query parameters. For example:</p>
    <pre>https://images.hsingh.site/?url=&lt;image_url&gt;&w=300&h=200&q=75</pre>
    <p>Or, to render text on an image:</p>
    <pre>https://images.hsingh.site/?text=hello%20world&w=400&h=200&fontFamily=Courier%20New&roundedCorners=true&txtColor=red&fontSize=42</pre>

    <h2>Support</h2>
    <p>If you find this service helpful, consider supporting the development:</p>
    <p><a href='https://paypal.me/hsiingh'><img src='https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif' alt='Donate'></a></p>
    <p>Thank you for your support!</p>


      <h2>Query Parameters</h2>
      <ul>
        <li><code>url</code>: The URL of the image to process.</li>
        <li><code>w</code>: Width of the image in pixels. Default: Original image width.</li>
        <li><code>h</code>: Height of the image in pixels. Default: Original image height.</li>
        <li><code>dpr</code>: Device Pixel Ratio. Default: 1.</li>
        <li><code>bg</code>: Background color in hex format (e.g., <code>#ffffff</code>). Default: None (transparent background).</li>
        <li><code>blur</code>: Blur amount. Range: 0.3 to 1000. Default: No blur.</li>
        <li><code>gam</code>: Gamma correction. Range: 1.0 to 3.0. Default: 2.2.</li>
        <li><code>mod</code>: Modulate (brightness, saturation, hue) in the format <code>brightness,saturation,hue</code>. Default: <code>1,1,0</code>.</li>
        <li><code>sharp</code>: Sharpen amount. Default: No sharpening.</li>
        <li><code>encoding</code>: Encoding type. Supported: <code>base64</code>. Default: None.</li>
        <li><code>maxage</code>: Cache-Control max age in seconds. Default: 31536000 (1 year).</li>
        <li><code>l</code>: Compression level for PNG. Range: 0 to 9. Default: 6.</li>
        <li><code>default</code>: Default image URL if the primary URL fails. Default: None.</li>
        <li><code>filename</code>: Filename for the downloaded image. Default: None.</li>
        <li><code>il</code>: Interlace for progressive images. Supported: <code>true</code>. Default: None.</li>
        <li><code>n</code>: Number of pages (for multi-page formats). Default: 1. Use <code>-1</code> for all pages.</li>
        <li><code>output</code>: Output format. Supported: <code>jpg</code>, <code>png</code>, <code>gif</code>, <code>tiff</code>, <code>webp</code>, <code>json</code>, <code>jpeg</code>. Default: <code>jpeg</code>.</li>
        <li><code>page</code>: Specific page number (for multi-page formats). Default: 0 (first page).</li>
        <li><code>q</code>: Quality of the image. Range: 1 to 100. Default: 80.</li>
        <li><code>text</code>: Text to render on the image. Default: None.</li>
        <li><code>txtColor</code>: Text color in hex format. Default: <code>#000000</code> (black).</li>
        <li><code>fontSize</code>: Font size for text rendering. Default: 48.</li>
        <li><code>fontFamily</code>: Font family for text rendering. Default: Arial.</li>
        <li><code>textAlign</code>: Text alignment (<code>left</code>, <code>center</code>, <code>right</code>). Default: <code>center</code>.</li>
        <li><code>textBaseline</code>: Vertical alignment of text (<code>top</code>, <code>hanging</code>, <code>middle</code>, <code>alphabetic</code>, <code>ideographic</code>, <code>bottom</code>). Default: <code>middle</code>.</li>
        <li><code>roundedCorners</code>: Whether to have rounded corners (true/false). Default: false.</li>
        <li><code>cornerRadius</code>: Radius of the corners if <code>roundedCorners</code> is true. Default: 20.</li>
      </ul>

      <h3>Currently Not Supported (Coming in Future Updates)</h3>
      <ul>
        <li><del><code>fit</code>: How the image should be resized.</del></li>
        <li><del><code>cbg</code>: Contain background color.</del></li>
        <li><del><code>we</code>: Without enlargement.</del></li>
        <li><del><code>a</code>: Alignment position.</del></li>
        <li><del><code>fpx</code>: Focal point X.</del></li>
        <li><del><code>fpy</code>: Focal point Y.</del></li>
        <li><del><code>crop</code>: Rectangle crop.</del></li>
        <li><del><code>trim</code>: Trim.</del></li>
        <li><del><code>mask</code>: Mask type.</del></li>
        <li><del><code>mtrim</code>: Mask trim.</del></li>
        <li><del><code>mbg</code>: Mask background.</del></li>
        <li><del><code>flip</code>: Flip the image vertically.</del></li>
        <li><del><code>flop</code>: Flop the image horizontally.</del></li>
        <li><del><code>ro</code>: Rotation.</del></li>
        <li><del><code>rbg</code>: Rotation background.</del></li>
        <li><del><code>con</code>: Contrast.</del></li>
        <li><del><code>filt</code>: Filter.</del></li>
        <li><del><code>sat</code>: Saturation level.</del></li>
        <li><del><code>hue</code>: Hue rotation.</del></li>
        <li><del><code>tint</code>: Tint.</del></li>
        <li><del><code>af</code>: Adaptive filter for PNG.</del></li>
      </ul>

      <p>Default values are used if parameters are not specified.</p>
    `;
