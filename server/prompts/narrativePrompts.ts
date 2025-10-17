import { VideoSlide, NarrativeStage } from '../../types';

export const NARRATIVE_STAGE_DESCRIPTIONS = {
  hook: "Create an engaging opening that hooks the student's interest",
  discovery: "Tell the story of how this concept was discovered or invented",
  evolution: "Show how the concept evolved and developed over time",
  application: "Demonstrate real-world applications with concrete examples",
  future: "Explore future implications and potential developments"
};

export const generateNarrativePrompt = (conceptTitle: string, conceptDescription: string): string => {
  return `Create an engaging, story-driven educational presentation about "${conceptTitle}" (${conceptDescription}).

Your task is to generate a 5-slide narrative that follows this structure:

1. HOOK (Introduction): Start with an engaging question or scenario that makes the student curious about why this concept matters.

2. DISCOVERY: Tell the story of how this concept was discovered, invented, or first developed. Include historical context, key figures, and the circumstances that led to its creation.

3. EVOLUTION: Show how the concept evolved over time. What improvements were made? How did understanding deepen? What were the key milestones?

4. APPLICATION: Provide concrete, real-world examples of how this concept is used today. Make it relatable to the student's daily life.

5. FUTURE: Explore what the future holds for this concept. How might it evolve further? What new applications might emerge?

For each slide, provide:
- A compelling heading (max 60 characters)
- Engaging narration script (2-3 sentences, conversational tone)
- Detailed image prompt for visual generation

The narration should be:
- Conversational and engaging
- Age-appropriate for high school/college students
- Include specific examples and analogies
- Build a continuous story across all slides
- Use "you" to address the student directly

Format the response as JSON with this structure:
{
  "title": "The Story of [Concept]",
  "slides": [
    {
      "stage": "hook",
      "heading": "Compelling heading",
      "narration": "Engaging narration script...",
      "imagePrompt": "Detailed visual description for AI image generation"
    },
    // ... 4 more slides for discovery, evolution, application, future
  ]
}

Make sure each slide builds on the previous one to create a cohesive narrative journey.`;
};

export const getStageIcon = (stage: NarrativeStage): string => {
  const icons = {
    hook: '🎣',
    discovery: '🔍',
    evolution: '📈',
    application: '🌍',
    future: '🚀'
  };
  return icons[stage];
};

export const getStageColor = (stage: NarrativeStage): string => {
  const colors = {
    hook: 'text-yellow-400',
    discovery: 'text-blue-400',
    evolution: 'text-green-400',
    application: 'text-purple-400',
    future: 'text-pink-400'
  };
  return colors[stage];
};

export const getStageBackgroundColor = (stage: NarrativeStage): string => {
  const colors = {
    hook: 'bg-yellow-900/20',
    discovery: 'bg-blue-900/20',
    evolution: 'bg-green-900/20',
    application: 'bg-purple-900/20',
    future: 'bg-pink-900/20'
  };
  return colors[stage];
};
