// Simple working server for video generation
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Video generation endpoints
app.post('/api/generate-video-outline', async (req, res) => {
  const { conceptId, conceptTitle, conceptDescription } = req.body ?? {};
  if (!conceptId || !conceptTitle || !conceptDescription) {
    return res.status(400).json({ error: 'conceptId, conceptTitle, and conceptDescription are required' });
  }
  
  try {
    // Generate story-driven outline
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Failed to assemble video' });
  }
});

// Serve static files
const tmpDir = path.join(process.cwd(), 'server', 'tmp');
app.use('/assets', express.static(tmpDir));

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
