import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath((ffmpegInstaller as any).path);

export interface StitchParams {
  imageFiles: string[]; // absolute paths
  audioFile: string; // absolute path
  outputFile: string; // absolute path
  perSlideSeconds: number[]; // length per image
}

export async function stitchSlidesToVideo(params: StitchParams): Promise<void> {
  return await new Promise((resolve, reject) => {
    const { imageFiles, audioFile, outputFile, perSlideSeconds } = params;
    const inputFps = 1;
    const filterInputs = imageFiles
      .map((img, idx) => `-loop 1 -t ${perSlideSeconds[idx] ?? 4} -i ${JSON.stringify(img)}`)
      .join(' ');

    // Build a concat filter for images
    const filter = imageFiles
      .map((_img, idx) => `[${idx}:v]fps=${inputFps},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v${idx}]`)
      .join(';') + `;` + imageFiles.map((_img, idx) => `[v${idx}]`).join('') + `concat=n=${imageFiles.length}:v=1:a=0,setsar=1[vout]`;

    const cmd = ffmpeg()
      .inputOptions(filterInputs.split(' '))
      .input(audioFile)
      .complexFilter(filter, ['vout'])
      .outputOptions(['-map [vout]', '-map ' + imageFiles.length + ':a', '-shortest'])
      .videoCodec('libx264')
      .audioCodec('aac')
      .output(outputFile)
      .on('end', resolve)
      .on('error', reject);

    cmd.run();
  });
}


