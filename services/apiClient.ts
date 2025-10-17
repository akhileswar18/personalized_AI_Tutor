export interface ApiOutlineSlide {
  heading: string;
  bullets: string[];
  narration: string;
  imagePrompt: string;
}

export interface ApiOutlineResponse {
  title: string;
  audience: string;
  slides: ApiOutlineSlide[];
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8787';

export async function fetchOutline(payload: { topic: string; goal: string; level?: string }): Promise<ApiOutlineResponse> {
  const resp = await fetch(`${API_BASE}/api/outline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!resp.ok) throw new Error('Outline failed');
  return await resp.json();
}

export async function generateImages(slides: ApiOutlineSlide[]) {
  const resp = await fetch(`${API_BASE}/api/slides`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slides }) });
  if (!resp.ok) throw new Error('Images failed');
  return await resp.json();
}

export async function synthesize(script: string) {
  const resp = await fetch(`${API_BASE}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script }) });
  if (!resp.ok) throw new Error('TTS failed');
  return await resp.json();
}

export async function assembleVideo(params: { imageFiles: string[]; audioFile: string; perSlideSeconds: number[] }) {
  const resp = await fetch(`${API_BASE}/api/video`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
  if (!resp.ok) throw new Error('Video assembly failed');
  return await resp.json();
}





