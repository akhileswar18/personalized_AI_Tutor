import { VideoOutline, VideoMetadata, VideoGenerationProgress } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8787';

export const videoService = {
  // Generate video outline
  async generateOutline(conceptId: string, conceptTitle: string, conceptDescription: string): Promise<VideoOutline> {
    const response = await fetch(`${API_BASE}/api/generate-video-outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptId, conceptTitle, conceptDescription })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate video outline');
    }
    
    return await response.json();
  },

  // Generate slide images
  async generateImages(slides: any[]): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/generate-video-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate images');
    }
    
    const data = await response.json();
    return data.imageUrls;
  },

  // Generate narration audio
  async generateNarration(slides: any[]): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/generate-video-narration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate narration');
    }
    
    const data = await response.json();
    return data.audioUrls;
  },

  // Assemble final video
  async assembleVideo(conceptId: string, images: string[], audioFiles: string[], slides: any[]): Promise<string> {
    const response = await fetch(`${API_BASE}/api/assemble-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptId, images, audioFiles, slides })
    });
    
    if (!response.ok) {
      throw new Error('Failed to assemble video');
    }
    
    const data = await response.json();
    return data.videoUrl;
  },

  // Complete video generation with progress tracking
  async generateVideo(
    conceptId: string, 
    conceptTitle: string, 
    conceptDescription: string,
    onProgress?: (progress: VideoGenerationProgress) => void
  ): Promise<VideoMetadata> {
    try {
      // Stage 1: Generate outline
      onProgress?.({
        stage: 'outline',
        progress: 10,
        message: 'Crafting story outline...'
      });
      
      const outline = await this.generateOutline(conceptId, conceptTitle, conceptDescription);
      
      // Stage 2: Generate images
      onProgress?.({
        stage: 'images',
        progress: 30,
        message: 'Generating visuals...'
      });
      
      const imageUrls = await this.generateImages(outline.slides);
      
      // Update slides with image URLs
      const slidesWithImages = outline.slides.map((slide, index) => ({
        ...slide,
        imageUrl: imageUrls[index]
      }));
      
      // Stage 3: Generate narration
      onProgress?.({
        stage: 'narration',
        progress: 60,
        message: 'Creating narration...'
      });
      
      const audioUrls = await this.generateNarration(slidesWithImages);
      
      // Update slides with audio URLs
      const slidesWithAudio = slidesWithImages.map((slide, index) => ({
        ...slide,
        audioUrl: audioUrls[index]
      }));
      
      // Stage 4: Assemble video
      onProgress?.({
        stage: 'assembly',
        progress: 80,
        message: 'Assembling presentation...'
      });
      
      const videoUrl = await this.assembleVideo(conceptId, imageUrls, audioUrls, slidesWithAudio);
      
      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Video ready!'
      });
      
      const metadata: VideoMetadata = {
        conceptId,
        title: outline.title,
        videoUrl,
        duration: outline.estimatedDuration,
        generatedAt: new Date()
      };
      
      // Cache the video metadata
      this.cacheVideoMetadata(metadata);
      
      return metadata;
      
    } catch (error) {
      onProgress?.({
        stage: 'outline',
        progress: 0,
        message: 'Generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },

  // Cache video metadata in localStorage
  cacheVideoMetadata(metadata: VideoMetadata): void {
    const cached = this.getCachedVideos();
    cached[metadata.conceptId] = metadata;
    localStorage.setItem('videoCache', JSON.stringify(cached));
  },

  // Get cached video metadata
  getCachedVideos(): Record<string, VideoMetadata> {
    try {
      const cached = localStorage.getItem('videoCache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  },

  // Check if video exists for concept
  hasVideo(conceptId: string): boolean {
    const cached = this.getCachedVideos();
    return conceptId in cached;
  },

  // Get video metadata for concept
  getVideoMetadata(conceptId: string): VideoMetadata | null {
    const cached = this.getCachedVideos();
    return cached[conceptId] || null;
  },

  // Clear video cache
  clearCache(): void {
    localStorage.removeItem('videoCache');
  }
};
