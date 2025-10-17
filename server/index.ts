import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { generateOutline } from './providers/llm';
import { generateSlideImage } from './providers/image';
import { synthesizeSpeech } from './providers/tts';
import { stitchSlidesToVideo } from './utils/ffmpeg';
// import { generateVideoOutline, generateSlideImages, generateNarrationAudio, assembleVideo } from './services/videoGenerator';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(express.json({ limit: '2mb' }));

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// TODO: wire real routes in subsequent tasks
app.post('/api/outline', async (req, res) => {
  const { topic, goal, level } = req.body ?? {};
  if (!topic || !goal) return res.status(400).json({ error: 'topic and goal are required' });
  const data = await generateOutline({ topic, goal, level });
  res.json(data);
});

app.post('/api/slides', async (req, res) => {
  const { slides } = req.body ?? {};
  if (!Array.isArray(slides)) return res.status(400).json({ error: 'slides array required' });
  const results = await Promise.all(slides.map((s: any, i: number) => generateSlideImage({ prompt: s.imagePrompt ?? s.heading, slideIndex: i })));
  res.json({ images: results });
});

app.post('/api/tts', async (req, res) => {
  const { script, voice } = req.body ?? {};
  if (!script) return res.status(400).json({ error: 'script required' });
  const result = await synthesizeSpeech({ text: script, voice });
  res.json(result);
});

app.post('/api/video', async (req, res) => {
  const { imageFiles, audioFile, perSlideSeconds } = req.body ?? {};
  if (!imageFiles || !audioFile || !perSlideSeconds) return res.status(400).json({ error: 'imageFiles, audioFile, perSlideSeconds required' });
  const outFile = path.join(process.cwd(), 'server', 'tmp', 'presentation.mp4');
  try {
    await stitchSlidesToVideo({ imageFiles, audioFile, outputFile: outFile, perSlideSeconds });
    res.json({ videoUrl: '/assets/presentation.mp4' });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'ffmpeg failed' });
  }
});

// Serve temporary assets (images/audio/videos) if present
const tmpDir = path.join(process.cwd(), 'server', 'tmp');
app.use('/assets', express.static(tmpDir));

// Serve video files with proper headers
app.use('/assets/videos', express.static(path.join(tmpDir, 'videos'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Video generation endpoints
app.post('/api/generate-video-outline', async (req, res) => {
  const { conceptId, conceptTitle, conceptDescription } = req.body ?? {};
  if (!conceptId || !conceptTitle || !conceptDescription) {
    return res.status(400).json({ error: 'conceptId, conceptTitle, and conceptDescription are required' });
  }
  
  try {
    // Simplified video outline for now
    const outline = {
      title: `The Story of ${conceptTitle}`,
      conceptId,
      slides: [
        {
          stage: "hook",
          heading: `Why ${conceptTitle} Matters`,
          narration: `Imagine a world where ${conceptDescription.toLowerCase()}. This concept has revolutionized how we understand mathematics and solve real-world problems.`,
          imagePrompt: `Historical context of ${conceptTitle}, educational illustration`
        },
        {
          stage: "discovery",
          heading: `The Discovery of ${conceptTitle}`,
          narration: `The story of ${conceptTitle} began centuries ago when mathematicians first encountered the need to solve complex problems. This breakthrough changed everything.`,
          imagePrompt: `Discovery moment of ${conceptTitle}, historical mathematical scene`
        },
        {
          stage: "evolution",
          heading: `How ${conceptTitle} Evolved`,
          narration: `Over time, mathematicians refined and expanded our understanding of ${conceptTitle}. Each generation built upon the work of previous scholars.`,
          imagePrompt: `Timeline showing evolution of ${conceptTitle}, mathematical progression`
        },
        {
          stage: "application",
          heading: `${conceptTitle} in Real Life`,
          narration: `Today, ${conceptTitle} is used everywhere - from engineering to computer science, from economics to physics. It's a fundamental tool in our modern world.`,
          imagePrompt: `Real-world applications of ${conceptTitle}, modern examples`
        },
        {
          stage: "future",
          heading: `The Future of ${conceptTitle}`,
          narration: `Looking ahead, ${conceptTitle} will continue to evolve and find new applications. The future holds exciting possibilities for this fundamental concept.`,
          imagePrompt: `Futuristic applications of ${conceptTitle}, future technology`
        }
      ],
      estimatedDuration: 90,
      generatedAt: new Date()
    };
    
    res.json(outline);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to generate video outline' });
  }
});

app.post('/api/generate-video-images', async (req, res) => {
  const { slides } = req.body ?? {};
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: 'slides array is required' });
  }
  
  try {
    // Generate placeholder image URLs
    const imageUrls = slides.map((_, index) => 
      `https://via.placeholder.com/1920x1080/1e293b/60a5fa?text=Slide+${index + 1}`
    );
    res.json({ imageUrls });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to generate images' });
  }
});

app.post('/api/generate-video-narration', async (req, res) => {
  const { slides } = req.body ?? {};
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: 'slides array is required' });
  }
  
  try {
    // Generate placeholder audio URLs
    const audioUrls = slides.map((_, index) => `/assets/audio/slide_${index + 1}.mp3`);
    res.json({ audioUrls });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to generate narration' });
  }
});

app.post('/api/assemble-video', async (req, res) => {
  const { conceptId, images, audioFiles, slides } = req.body ?? {};
  if (!conceptId || !Array.isArray(images) || !Array.isArray(audioFiles) || !Array.isArray(slides)) {
    return res.status(400).json({ error: 'conceptId, images, audioFiles, and slides arrays are required' });
  }
  
  try {
    // Return a placeholder video URL
    const videoUrl = `/assets/videos/${conceptId}/presentation.mp4`;
    res.json({ videoUrl });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to assemble video' });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});


