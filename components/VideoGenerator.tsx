import React, { useState } from 'react';
import { ConceptNode, VideoGenerationProgress } from '../types';
import { videoService } from '../services/videoService';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface VideoGeneratorProps {
  concept: ConceptNode;
  onVideoGenerated: (videoUrl: string) => void;
  onClose?: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ concept, onVideoGenerated, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<VideoGenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(null);

    try {
      const videoMetadata = await videoService.generateVideo(
        concept.id,
        concept.title,
        concept.description,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      onVideoGenerated(videoMetadata.videoUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const getProgressIcon = (stage: string) => {
    switch (stage) {
      case 'outline': return '📝';
      case 'images': return '🎨';
      case 'narration': return '🎤';
      case 'assembly': return '🎬';
      case 'complete': return '✅';
      default: return '⏳';
    }
  };

  const getProgressColor = (stage: string) => {
    switch (stage) {
      case 'outline': return 'text-yellow-400';
      case 'images': return 'text-blue-400';
      case 'narration': return 'text-green-400';
      case 'assembly': return 'text-purple-400';
      case 'complete': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-400">
          Generate Interactive Video
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          {concept.title}
        </h3>
        <p className="text-slate-400 mb-4">
          {concept.description}
        </p>
        <div className="bg-slate-700 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">
            What you'll get:
          </h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>🎣 <strong>Introduction:</strong> Engaging hook to capture your interest</li>
            <li>🔍 <strong>Discovery:</strong> The story of how this concept was invented</li>
            <li>📈 <strong>Evolution:</strong> How it developed over time</li>
            <li>🌍 <strong>Real-world:</strong> Practical examples you can relate to</li>
            <li>🚀 <strong>Future:</strong> What's coming next</li>
          </ul>
        </div>
      </div>

      {error && (
        <Alert 
          message={error} 
          type="error" 
          onClose={() => setError(null)} 
        />
      )}

      {progress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${getProgressColor(progress.stage)}`}>
              {getProgressIcon(progress.stage)} {progress.message}
            </span>
            <span className="text-sm text-slate-400">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {!isGenerating && !progress && (
        <div className="space-y-4">
          <button
            onClick={handleGenerateVideo}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center space-x-2"
          >
            <span>🎬</span>
            <span>Generate Interactive Video</span>
          </button>
          
          <p className="text-xs text-slate-500 text-center">
            This will create a story-driven presentation covering the discovery, evolution, 
            and real-world applications of {concept.title}.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="text-center">
          <LoadingSpinner text="Creating your interactive video..." />
          <p className="text-sm text-slate-400 mt-2">
            This may take a few minutes. Please don't close this window.
          </p>
        </div>
      )}

      {progress?.stage === 'complete' && (
        <div className="text-center">
          <div className="text-green-400 text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Video Ready!
          </h3>
          <p className="text-sm text-slate-400">
            Your interactive video presentation has been generated successfully.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
