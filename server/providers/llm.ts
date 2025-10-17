export interface OutlineSlide {
  heading: string;
  bullets: string[];
  narration: string;
  imagePrompt: string;
}

export interface OutlineResponse {
  title: string;
  audience: string;
  slides: OutlineSlide[];
}

export async function generateOutline(params: {
  topic: string;
  goal: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  provider?: 'groq' | 'together';
}): Promise<OutlineResponse> {
  const level = params.level ?? 'beginner';
  const provider = params.provider ?? (process.env.GROQ_API_KEY ? 'groq' : 'together');

  const system = `You are a pedagogy-focused tutor. Produce concise, practical slide bullets and engaging narration for ${level} learners studying ${params.topic} because ${params.goal}. Output strictly as JSON with keys: title, audience, slides[{heading, bullets[], narration, imagePrompt}]. 6 to 8 slides.`;
  const user = `Topic: ${params.topic}\nGoal: ${params.goal}\nAudience level: ${level}`;

  let content = '';
  if (provider === 'groq') {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY not set');
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      })
    });
    const json: any = await resp.json();
    content = json.choices?.[0]?.message?.content ?? '';
  } else {
    const key = process.env.TOGETHER_API_KEY;
    if (!key) throw new Error('TOGETHER_API_KEY not set');
    const resp = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      })
    });
    const json: any = await resp.json();
    content = json.choices?.[0]?.message?.content ?? '';
  }

  try {
    const parsed: OutlineResponse = JSON.parse(content);
    return parsed;
  } catch {
    // Fallback minimal outline if JSON parsing fails
    return {
      title: `${params.topic} — Essentials`,
      audience: `${level} learners`,
      slides: [
        {
          heading: `Why ${params.topic} matters`,
          bullets: [
            `Motivation: ${params.goal}`,
            'Real-world impact',
            'What you will learn today'
          ],
          narration: `In this lesson, we explore ${params.topic} and why it matters for ${params.goal}.`,
          imagePrompt: `${params.topic} explained to ${level} students, educational characters, clean infographic`
        }
      ]
    };
  }
}


