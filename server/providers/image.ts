import fs from 'fs/promises';
import path from 'path';

export interface GeneratedImage {
  filePath: string; // absolute
  publicUrl: string; // served under /assets
}

export async function generateSlideImage(params: {
  prompt: string;
  slideIndex: number;
}): Promise<GeneratedImage> {
  const tmpDir = path.join(process.cwd(), 'server', 'tmp');
  await fs.mkdir(tmpDir, { recursive: true });
  const fileName = `slide_${params.slideIndex}.png`;
  const abs = path.join(tmpDir, fileName);

  const falKey = process.env.FAL_KEY;
  if (falKey) {
    const resp = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Key ${falKey}` },
      body: JSON.stringify({ prompt: params.prompt, image_size: '1024x576' })
    });
    const json: any = await resp.json();
    const url = json.images?.[0]?.url ?? json.image?.url;
    if (url) {
      const imgResp = await fetch(url);
      const buf = Buffer.from(await imgResp.arrayBuffer());
      await fs.writeFile(abs, buf);
      return { filePath: abs, publicUrl: `/assets/${fileName}` };
    }
  }

  // Fallback: write placeholder PNG from a simple 1x1 pixel
  const pixel = Buffer.from(
    '89504e470d0a1a0a0000000d4948445200000001000000010802000000907724' +
      '0000000a49444154789c6360000002000154a24f5d0000000049454e44ae426082',
    'hex'
  );
  await fs.writeFile(abs, pixel);
  return { filePath: abs, publicUrl: `/assets/${fileName}` };
}


