// Text-to-Speech utility using Web Speech API
export class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Load voices when they become available
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    // Prefer English voices, fallback to first available
    this.currentVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
  }

  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      utterance.voice = options?.voice || this.currentVoice;
      
      // Set speech parameters
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  stop() {
    this.synth.cancel();
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  setVoice(voice: SpeechSynthesisVoice) {
    this.currentVoice = voice;
  }

  // Generate audio file (placeholder - would need server-side implementation)
  async generateAudioFile(text: string, filename: string): Promise<string> {
    // This is a placeholder implementation
    // In a real implementation, you'd:
    // 1. Use a server-side TTS service
    // 2. Save the audio to a file
    // 3. Return the file URL
    
    console.log(`Would generate audio file: ${filename} for text: ${text.substring(0, 50)}...`);
    return `/assets/audio/${filename}`;
  }
}

// Export singleton instance
export const ttsService = new TTSService();
