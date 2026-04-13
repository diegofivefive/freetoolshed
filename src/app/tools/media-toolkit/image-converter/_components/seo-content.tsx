import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Image Converter — Change Image Formats Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Image Converter lets you convert images between PNG, JPG,
        WebP, and AVIF directly in your browser. Batch convert entire folders
        of images, adjust quality, and optionally resize — all without
        sign-ups, uploads, or file size limits. Your images never leave your
        device.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>4 output formats</strong> — PNG (lossless), JPG (lossy),
          WebP (modern lossy/lossless), and AVIF (next-gen lossy). Accepts
          PNG, JPG, WebP, AVIF, BMP, GIF, TIFF, and SVG as input.
        </li>
        <li>
          <strong>Quality control</strong> — Adjust quality from 1-100% for
          lossy formats. Find the perfect balance between file size and visual
          quality for your use case.
        </li>
        <li>
          <strong>Optional resize</strong> — Set a max dimension to
          automatically scale down images while preserving aspect ratio.
          Perfect for preparing images for web or social media.
        </li>
        <li>
          <strong>Batch conversion</strong> — Add as many images as you want
          and convert them all at once. Each file gets a thumbnail preview and
          individual download button.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses the browser&apos;s Canvas
          API. No server uploads, no external dependencies, no file size
          limits.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Convert Images
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add images</strong> — Drag and drop image files into the
          upload area, or click to browse. Add files in multiple batches if
          needed.
        </li>
        <li>
          <strong>2. Choose format</strong> — Select your target format: PNG,
          JPG, WebP, or AVIF.
        </li>
        <li>
          <strong>3. Set quality</strong> — For lossy formats, adjust the
          quality slider (1-100%). Higher values produce better quality but
          larger files. PNG is always lossless.
        </li>
        <li>
          <strong>4. Optional resize</strong> — Enter a max dimension in
          pixels to scale down large images. Leave blank to keep the original
          size.
        </li>
        <li>
          <strong>5. Convert &amp; download</strong> — Click Convert and
          download each file individually, or use Download All for the entire
          batch.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Image Format Comparison
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Format</th>
              <th className="py-2 pr-4 text-left font-semibold">Type</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Transparency
              </th>
              <th className="py-2 pr-4 text-left font-semibold">File Size</th>
              <th className="py-2 pr-4 text-left font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">PNG</td>
              <td className="py-2 pr-4">Lossless</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2 pr-4">Large</td>
              <td className="py-2 pr-4">
                Screenshots, graphics, logos, icons
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">JPG</td>
              <td className="py-2 pr-4">Lossy</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2 pr-4">Small</td>
              <td className="py-2 pr-4">
                Photos, social media, email attachments
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">WebP</td>
              <td className="py-2 pr-4">Both</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2 pr-4">Smaller</td>
              <td className="py-2 pr-4">
                Web images, replacing both PNG and JPG
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">AVIF</td>
              <td className="py-2 pr-4">Both</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2 pr-4">Smallest</td>
              <td className="py-2 pr-4">
                Next-gen web images, maximum compression
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <div>
          <h3 className="font-semibold text-foreground">
            Will converting JPG to PNG improve image quality?
          </h3>
          <p className="mt-1">
            No. Once an image has been saved as JPG, the lossy compression has
            already discarded some data. Converting to PNG preserves what
            remains without further loss, but it won&apos;t recover the
            original quality. The PNG file will likely be larger too. Convert
            from your original source if you need the best quality.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            What happens to transparency when converting to JPG?
          </h3>
          <p className="mt-1">
            JPG doesn&apos;t support transparency. Any transparent areas in
            your image are filled with a white background. If you need to
            preserve transparency, convert to PNG or WebP instead.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Should I use WebP or AVIF for my website?
          </h3>
          <p className="mt-1">
            Both are excellent choices. WebP is supported in all modern
            browsers and offers 25-35% smaller files than JPG. AVIF achieves
            even better compression (about 20% smaller than WebP) but
            encoding is slower and support in older browsers is limited. For
            maximum compatibility, use WebP. For bleeding-edge optimization,
            use AVIF with a WebP fallback.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Why is AVIF greyed out in the format dropdown?
          </h3>
          <p className="mt-1">
            AVIF encoding requires browser support. If the AVIF option is
            disabled, your browser cannot encode AVIF images. Chrome, Edge,
            and recent Firefox versions support AVIF encoding. Safari support
            is still limited.
          </p>
        </div>
      </div>
    </section>
  );
}
