# Personalized AI Tutor with Knowledge Graph & Video Presentations

A comprehensive educational platform that combines AI-powered tutoring with interactive video presentations and a structured knowledge graph for personalized learning experiences.

## 🌟 Features

### Core Learning System
- **Interactive Knowledge Graph**: Visual roadmap showing learning paths and concept dependencies
- **AI-Powered Tutoring**: Chat interface with contextual AI assistance using Groq API
- **Adaptive Assessment**: Initial knowledge assessment to personalize learning paths
- **Progress Tracking**: Track mastered concepts and unlock new learning opportunities

### Video Presentation System
- **Story-Driven Videos**: Generate interactive video presentations following a narrative arc:
  - **Hook**: Engaging introduction to capture interest
  - **Discovery**: The story of how the concept was invented/discovered
  - **Evolution**: How the concept developed over time
  - **Real-World Application**: Practical examples and modern usage
  - **Future**: Potential advancements and future implications
- **Interactive Video Player**: Navigate between narrative stages, adjust playback speed
- **Progress Tracking**: Visual progress indicators during video generation
- **Caching System**: Store and reuse generated videos for efficient learning

### Advanced Features
- **Mathematical Rendering**: LaTeX support with MathJax for complex equations
- **Quiz System**: AI-generated questions with retry logic and detailed feedback
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Responsive Design**: Modern, dark-themed UI optimized for learning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key (for AI tutoring)
- Gemini API key (optional, for enhanced features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personalized-ai-tutor-with-knowledge-graph.git
   cd personalized-ai-tutor-with-knowledge-graph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8787
   VITE_API_BASE=http://localhost:8787
   ```

4. **Start the development servers**
   
   **Backend (Terminal 1):**
   ```bash
   npm run server:dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8787

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Components**: Modular React components with TypeScript
- **Services**: API client services for backend communication
- **State Management**: React hooks for local state management
- **Styling**: Tailwind CSS for responsive design

### Backend (Express + TypeScript)
- **API Endpoints**: RESTful API for all functionality
- **AI Integration**: Groq API for LLM capabilities
- **Video Generation**: Multi-stage video creation pipeline
- **File Management**: Temporary storage for generated assets

### Key Directories
```
├── components/          # React components
│   ├── VideoPlayer.tsx  # Interactive video player
│   ├── VideoGenerator.tsx # Video generation UI
│   ├── ConceptView.tsx  # Main concept display
│   └── ...
├── server/             # Backend Express server
│   ├── services/       # Business logic services
│   ├── providers/      # External API providers
│   └── utils/          # Utility functions
├── services/           # Frontend API services
└── types.ts           # TypeScript type definitions
```

## 🎥 Video Generation System

The video presentation system creates engaging, story-driven educational content:

### Narrative Structure
1. **Hook**: Captures attention with relevance and intrigue
2. **Discovery**: Historical context and invention story
3. **Evolution**: Development timeline and key milestones
4. **Application**: Real-world examples and modern usage
5. **Future**: Potential advancements and implications

### Technical Implementation
- **Outline Generation**: AI-powered narrative structure creation
- **Image Generation**: Placeholder images with descriptive prompts
- **Audio Synthesis**: Web Speech API for narration
- **Video Assembly**: FFmpeg-based video compilation
- **Caching**: Local storage for generated content

## 🔧 API Endpoints

### Core Learning
- `GET /api/health` - Health check
- `POST /api/chat` - AI tutoring chat
- `POST /api/quiz/generate` - Generate quiz questions
- `POST /api/quiz/evaluate` - Evaluate quiz answers

### Video Generation
- `POST /api/generate-video-outline` - Create narrative structure
- `POST /api/generate-video-images` - Generate slide images
- `POST /api/generate-video-narration` - Create audio narration
- `POST /api/assemble-video` - Compile final video

## 🎯 Usage

### For Students
1. **Initial Assessment**: Complete the onboarding quiz to assess prior knowledge
2. **Explore Knowledge Graph**: Navigate the visual learning roadmap
3. **Learn Concepts**: Read explanations, watch videos, and practice with quizzes
4. **Track Progress**: Monitor mastered concepts and unlock new topics

### For Educators
1. **Customize Content**: Modify the knowledge graph structure
2. **Monitor Progress**: Track student learning paths
3. **Generate Videos**: Create story-driven presentations for any concept

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start frontend development server
npm run server:dev   # Start backend development server
npm run build        # Build frontend for production
npm run server:build # Build backend for production
npm run server:start # Start production backend server
```

### Adding New Concepts
1. Update `constants.ts` with new concept definitions
2. Add prerequisite relationships in the knowledge graph
3. Test video generation for new concepts

### Customizing Video Content
1. Modify narrative prompts in `server/prompts/narrativePrompts.ts`
2. Adjust video generation logic in `server/services/videoGenerator.ts`
3. Update frontend video components as needed

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI tutoring | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `PORT` | Backend server port | No (default: 8787) |
| `VITE_API_BASE` | Backend API base URL | No (default: http://localhost:8787) |

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
- Ensure you're in the correct directory
- Check that all dependencies are installed
- Verify environment variables are set

**Video generation fails:**
- Check browser console for errors
- Verify backend server is running
- Ensure API keys are properly configured

**Math equations not rendering:**
- Check MathJax is loaded in the browser
- Verify LaTeX syntax in content

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for AI API services
- **Google Gemini** for enhanced AI capabilities
- **MathJax** for mathematical rendering
- **FFmpeg** for video processing
- **React** and **Express** communities for excellent frameworks

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ for personalized education**# personalized_AI_Tutor
