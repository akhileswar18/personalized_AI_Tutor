import fs from 'fs/promises';
import path from 'path';

export interface TtsResult {
  filePath: string;
  publicUrl: string;
  durationSec?: number;
}

export async function synthesizeSpeech(params: { text: string; voice?: string }): Promise<TtsResult> {
  const tmpDir = path.join(process.cwd(), 'server', 'tmp');
  await fs.mkdir(tmpDir, { recursive: true });
  const fileName = `narration.wav`;
  const abs = path.join(tmpDir, fileName);

  const token = process.env.HF_TOKEN;
  if (!token) {
    // Fallback: create silent wav of 3 seconds
    const header = Buffer.from(
      '52494646d204000057415645666d74201000000001000100401f0000803e00000200100064617461ae040000',
      'hex'
    );
    const silence = Buffer.alloc(0xae0, 0);
    await fs.writeFile(abs, Buffer.concat([header, silence]));
    return { filePath: abs, publicUrl: `/assets/${fileName}`, durationSec: 3 };
  }

  const resp = await fetch('https://api-inference.huggingface.co/models/coqui/XTTS-v2', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: params.text })
  });
  const buf = Buffer.from(await resp.arrayBuffer());
  await fs.writeFile(abs, buf);
  return { filePath: abs, publicUrl: `/assets/${fileName}` };
}


