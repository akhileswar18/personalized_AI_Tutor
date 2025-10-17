import { VideoOutline, VideoSlide, NarrativeStage } from '../../types';
import { generateNarrativePrompt } from '../prompts/narrativePrompts';

export interface VideoGenerationParams {
  conceptId: string;
  conceptTitle: string;
  conceptDescription: string;
}

export interface VideoGenerationResult {
  outline: VideoOutline;
  images: string[];
  audioFiles: string[];
  videoUrl: string;
}

const parseJsonFromMarkdown = <T>(jsonString: string): T | null => {
  let cleanJsonString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanJsonString.match(fenceRegex);
  if (match && match[2]) {
    cleanJsonString = match[2].trim();
  }
  try {
    return JSON.parse(cleanJsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error, "Original string:", jsonString);
    return null;
  }
};

export async function generateVideoOutline(params: VideoGenerationParams): Promise<VideoOutline> {
  const { conceptId, conceptTitle, conceptDescription } = params;
  
  const prompt = generateNarrativePrompt(conceptTitle, conceptDescription);
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator specializing in engaging, story-driven presentations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  const parsed = parseJsonFromMarkdown<{ title: string; slides: VideoSlide[] }>(content);
  
  if (!parsed || !parsed.slides || parsed.slides.length !== 5) {
    throw new Error("Failed to generate valid video outline");
  }

  // Validate that all required stages are present
  const requiredStages: NarrativeStage[] = ['hook', 'discovery', 'evolution', 'application', 'future'];
  const presentStages = parsed.slides.map(slide => slide.stage);
  
  for (const stage of requiredStages) {
    if (!presentStages.includes(stage)) {
      throw new Error(`Missing required stage: ${stage}`);
    }
  }

  // Calculate estimated duration (assuming 15-20 seconds per slide)
  const estimatedDuration = parsed.slides.length * 18;

  return {
    title: parsed.title,
    conceptId,
    slides: parsed.slides,
    estimatedDuration,
    generatedAt: new Date()
  };
}

export async function generateSlideImages(slides: VideoSlide[]): Promise<string[]> {
  const imageUrls: string[] = [];
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    // For now, we'll use a placeholder image service
    // In production, you'd integrate with fal.ai, DALL-E, or similar
    const imageUrl = await generatePlaceholderImage(slide.imagePrompt, i);
    imageUrls.push(imageUrl);
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return imageUrls;
}

async function generatePlaceholderImage(prompt: string, index: number): Promise<string> {
  // This is a placeholder implementation
  // In production, you'd call an actual image generation API
  const placeholderImages = [
    'https://via.placeholder.com/1920x1080/1e293b/60a5fa?text=Historical+Context',
    'https://via.placeholder.com/1920x1080/1e293b/34d399?text=Discovery+Story',
    'https://via.placeholder.com/1920x1080/1e293b/fbbf24?text=Evolution+Timeline',
    'https://via.placeholder.com/1920x1080/1e293b/a78bfa?text=Real+World+Example',
    'https://via.placeholder.com/1920x1080/1e293b/f472b6?text=Future+Vision'
  ];
  
  return placeholderImages[index] || placeholderImages[0];
}

export async function generateNarrationAudio(slides: VideoSlide[]): Promise<string[]> {
  const audioUrls: string[] = [];
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    // For now, we'll create placeholder audio files
    // In production, you'd use TTS service
    const audioUrl = await generatePlaceholderAudio(slide.narration, i);
    audioUrls.push(audioUrl);
  }
  
  return audioUrls;
}

async function generatePlaceholderAudio(narration: string, index: number): Promise<string> {
  // This is a placeholder implementation
  // In production, you'd call TTS service or use the existing synthesizeSpeech function
  console.log(`Generating audio for slide ${index + 1}: ${narration.substring(0, 50)}...`);
  return `/assets/audio/slide_${index + 1}.mp3`;
}

export async function assembleVideo(
  conceptId: string,
  images: string[],
  audioFiles: string[],
  slides: VideoSlide[]
): Promise<string> {
  // This would integrate with the existing FFmpeg functionality
  // For now, return a placeholder video URL
  const videoUrl = `/assets/videos/${conceptId}/presentation.mp4`;
  
  // In production, you'd:
  // 1. Download images and audio files
  // 2. Use FFmpeg to stitch them together
  // 3. Save to server/tmp/videos/{conceptId}/
  // 4. Return the final video URL
  
  return videoUrl;
}
