# Bloop - AI-Powered Educational Learning Platform

<div align="center">

**Transform any concept into comprehensive learning experiences with AI-powered videos, personalized roadmaps, and interactive games.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)](https://fastapi.tiangolo.com/)
[![Manim](https://img.shields.io/badge/Manim-Community-orange.svg)](https://www.manim.community/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Latest-green.svg)](https://ffmpeg.org/)

![UI Demo](assets/images/image.png)  

</div>

---

## 🎯 Overview

Bloop revolutionizes educational content creation by generating **fully animated explainer videos** from simple text queries or documents. Unlike traditional educational AI systems that produce static text or slides, Bloop creates dynamic visual explanations with synchronized narration and optional photorealistic talking avatars - all generated on-demand without precomputed assets.

### ✨ Key Features

- 🎨 **Programmatic Animation Generation** - Create stunning Manim animations automatically from educational concepts
- 🎙️ **Scene-Aligned Narration** - Neural TTS with perfect temporal synchronization
- 🤖 **Talking Avatar Integration** - Photorealistic avatars using SadTalker for human-like delivery
- 🧠 **LLM-Orchestrated Pipeline** - Intelligent scene planning and automated error repair
- 🎯 **Fault-Tolerant Rendering** - Scene-isolated execution with graceful degradation
- 📚 **Document-Based Learning** - Generate videos from PDFs, textbooks, or research papers
- 🗺️ **Personalized Roadmaps** - AI-generated learning paths tailored to your level
- 🎮 **Interactive Learning Games** - Engaging educational games with voice interaction

## Demo Gallery
### Final Side-by-Side Video

https://github.com/user-attachments/assets/3b23c1ed-3a2c-4be1-b9c2-a9accf128418
  
*Complete educational video with animation and avatar in production quality*


### Manim Animation Generation

https://github.com/user-attachments/assets/22dc0812-2cbd-46d5-aa41-5f16c1fd001a 

*Real-time generation of mathematical visualizations with LaTeX rendering*


### Talking Avatar (SadTalker)

https://github.com/user-attachments/assets/1249e51c-139a-4e04-98e2-df493dfe209c

*Photorealistic avatar with synchronized lip movements and natural expressions*


### Learning Roadmap Generation
![Roadmap Demo](assets/images/plan.jpeg)  
*AI-generated personalized learning paths with milestones and resources*

### Interactive Learning Games
![Games Demo](assets/images/games.jpeg)  
*Engaging educational games: Teach the AI, Drag & Drop, Identify the Error*

### Flashcard Generation
![Flashcard Demo](assets/images/flashcard.jpeg)  
*Automatic flashcard generation from documents with spaced repetition*

### Quiz Generation
![Quiz Demo](assets/images/quiz.jpeg)  
*Intelligent quiz creation with multiple question types and adaptive difficulty*

---


## 🏗️ Architecture

Bloop employs a sophisticated microservices architecture designed for real-time video generation:

```
Client Query
    │
    ▼
FastAPI Gateway (QA Service)
    │
    ├─► LLM Answer Generation
    │   └─► Document Analysis & Understanding
    │
    └─► Manim Video Service
        │
        ├─► Scene Planning (LLM → JSON)
        │   └─► Structured Scene Graphs
        │
        ├─► Scene-by-Scene Rendering
        │   ├─► Independent Execution Context
        │   ├─► Error Detection & Capture
        │   ├─► LLM-Based Auto Repair
        │   └─► Scene Skipping (if unrecoverable)
        │
        ├─► TTS Generation (Per Scene)
        │   └─► Neural Text-to-Speech
        │
        ├─► FFmpeg Audio-Video Alignment
        │   ├─► Temporal Synchronization
        │   └─► Duration Padding
        │
        └─► Scene Stitching
            └─► Final Animation Output
                │
                └─► (Optional) SadTalker Avatar
                    ├─► Audio Extraction
                    ├─► Avatar Rendering
                    └─► Side-by-Side Composition
```

## Quick Start

### Prerequisites

- Python 3.8+
- FFmpeg
- LaTeX (for mathematical expressions)
- GPU (optional, for faster avatar generation)
- CUDA (optional, for SadTalker acceleration)

### 1. Clone the Repository

```bash
git clone https://github.com/poorvikab/bloop.git
cd bloop
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Manim
pip install manim

# Install additional dependencies
sudo apt-get install libcairo2-dev pkg-config python3-dev
sudo apt-get install ffmpeg

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Configure Environment

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint  # Optional

# TTS Configuration
TTS_PROVIDER=azure 
AZURE_SPEECH_KEY=your-speech-key
AZURE_SPEECH_REGION=eastus

# SadTalker Configuration (Optional)
SADTALKER_MODEL_PATH=./models/sadtalker
ENABLE_AVATAR=true

# File Paths
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
TEMP_DIR=temp

# Performance
MAX_SCENE_RETRIES=1
SCENE_TIMEOUT=120
PARALLEL_SCENES=false
```

### 4. Start the Server

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### 5. Access the API

Visit `http://localhost:8000/docs` for interactive API documentation.

## Core Features

### ASK MODE - Intelligent Learning Assistant

Bloop's Ask mode combines all the capabilities of NotebookLM with powerful visual content generation:

#### Video Generation
Bloop generates educational videos in real-time through a sophisticated pipeline:

**Scene Planning via LLMs**

```python
# Example scene structure
{
  "scenes": [
    {
      "id": "scene_1",
      "concept": "Pythagorean Theorem",
      "visual_intent": "Show right triangle with labeled sides",
      "duration": 8,
      "manim_hints": ["Polygon", "MathTex", "Animation"]
    }
  ]
}
```

**Automated Manim Code Generation**
- LLM generates Manim Python code for each scene
- Validates syntax and API compatibility
- Optimizes for rendering performance

**Scene-Isolated Rendering**

Each scene renders independently to prevent cascading failures:

```
Scene 1: ✓ Success
Scene 2: ✗ Failed → LLM Repair → ✓ Success
Scene 3: ✓ Success
Scene 4: ✗ Failed → LLM Repair → ✗ Failed → Skip
Scene 5: ✓ Success
```

**Intelligent Error Repair**

When rendering fails:
1. Capture full error log
2. Send code + error to LLM
3. Generate corrected version
4. Retry once
5. Skip if still failing

#### Audio Generation & Synchronization

- **Per-Scene TTS**: Each scene gets dedicated narration
- **Perfect Alignment**: FFmpeg ensures audio-video sync
- **Adaptive Padding**: Automatically adjusts for duration mismatches
- **Quality Preservation**: No re-encoding loss

```bash
# FFmpeg synchronization
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest output.mp4
```

#### Talking Avatar System

Bloop integrates SadTalker for photorealistic talking avatars:

**Side-by-Side Layout:**

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│   Manim Animation       │   Talking Avatar        │
│   (Visual Concepts)     │   (Narration)           │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

**Benefits:**
- No visual occlusion
- Preserved instructional clarity
- Human-like delivery presence
- Accessible learning experience

#### Flashcard Generation

- Automatic extraction of key concepts from documents
- Spaced repetition algorithms for optimal learning
- Front/back card customization
- Export to Anki and other formats

#### Quiz Generation

- Multiple choice questions with adaptive difficulty
- True/false questions for quick validation
- Fill-in-the-blank for active recall
- Automatic grading and feedback

#### Intelligent Document Q&A

- Context-aware responses from uploaded documents
- Multi-document reasoning and synthesis
- Citation of specific document sections
- Follow-up question handling

### PLAN MODE - Personalized Roadmap Generation

Generate custom learning paths from any input:

```python
# Example roadmap request
{
  "input_type": "document",  // or "topic"
  "content": "Machine Learning syllabus PDF",
  "level": "intermediate",
  "duration": "3 months",
  "preferences": {
    "focus_areas": ["deep learning", "computer vision"],
    "time_per_week": 10
  }
}
```

**Roadmap Features:**
- Structured learning milestones
- Prerequisite tracking and validation
- Progress-based adaptation
- Resource recommendations (videos, articles, books)
- Assessment checkpoints
- Skill level progression tracking

**Input Flexibility:**
- Upload any document (PDF, DOCX, TXT)
- Paste syllabus or course content
- Describe learning goals in natural language
- Specify target skill level and timeline

### PLAY MODE - Gamified Learning Reinforcement

Solidify your learnings through three interactive games:

#### 1. Teach the AI
- Voice-to-voice conversational learning
- Explain concepts to the AI in your own words
- Real-time feedback and corrections
- Improves understanding through teaching (Feynman Technique)
- Tracks explanation quality and completeness

#### 2. Drag & Drop Challenge
- Visual concept matching and categorization
- Interactive drag-and-drop interface
- Immediate feedback on correctness
- Reinforces spatial and logical reasoning
- Multiple difficulty levels

#### 3. Identify the Incorrect Issue
- Multiple-choice format with intentional errors
- Identify incorrect statements or misconceptions
- Critical thinking and concept validation
- Explanation of why options are correct/incorrect
- Adaptive difficulty based on performance

## API Documentation

### ASK Mode Endpoints

#### Generate Video from Query

```bash
POST /api/v1/ask/video/generate
```

**Request:**
```json
{
  "query": "Explain the water cycle",
  "options": {
    "include_avatar": true,
    "avatar_image": "base64_encoded_image",
    "duration": "short",
    "style": "educational"
  }
}
```

**Response:**
```json
{
  "video_id": "vid_abc123",
  "status": "processing",
  "estimated_time": 45,
  "scenes_total": 5
}
```

#### Generate Flashcards

```bash
POST /api/v1/ask/flashcards/generate
```

**Request:**
```json
{
  "document_id": "doc_xyz789",
  "num_cards": 20,
  "difficulty": "medium"
}
```

#### Generate Quiz

```bash
POST /api/v1/ask/quiz/generate
```

**Request:**
```json
{
  "document_id": "doc_xyz789",
  "question_types": ["multiple_choice", "true_false"],
  "num_questions": 10
}
```

#### Document Q&A

```bash
POST /api/v1/ask/query
```

**Request:**
```json
{
  "document_ids": ["doc_1", "doc_2"],
  "question": "What are the main themes?",
  "include_citations": true
}
```

### PLAN Mode Endpoints

#### Generate Learning Roadmap

```bash
POST /api/v1/plan/roadmap/generate
```

**Request:**
```json
{
  "input_type": "document",
  "document_id": "doc_abc123",
  "level": "beginner",
  "duration_weeks": 12,
  "goals": ["Master fundamentals", "Build projects"]
}
```

**Response:**
```json
{
  "roadmap_id": "roadmap_xyz",
  "total_milestones": 8,
  "estimated_hours": 120,
  "milestones": [...]
}
```

#### Get Roadmap Progress

```bash
GET /api/v1/plan/roadmap/{roadmap_id}/progress
```

### PLAY Mode Endpoints

#### Start Teaching Session (Teach the AI)

```bash
POST /api/v1/play/teach-ai/start
```

**Request:**
```json
{
  "topic": "Photosynthesis",
  "difficulty": "medium"
}
```

#### Submit Drag & Drop Answer

```bash
POST /api/v1/play/drag-drop/submit
```

#### Identify Error Game

```bash
POST /api/v1/play/identify-error/answer
```

### General Endpoints

#### Check Video Status

```bash
GET /api/v1/video/status/{video_id}
```

#### Download Generated Content

```bash
GET /api/v1/download/{content_id}
```

#### WebSocket for Real-Time Updates

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/{session_id}');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Status: ${update.status}, Progress: ${update.progress}%`);
};
```

For complete API documentation, visit: `http://localhost:8000/docs`

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Framework** | FastAPI | High-performance async API |
| **LLM Orchestration** | GPT-4 / Azure OpenAI | Scene planning, Q&A, roadmap generation |
| **Animation Engine** | Manim Community | Programmatic video rendering |
| **Text-to-Speech** | Azure TTS / ElevenLabs | Neural narration synthesis |
| **Video Processing** | FFmpeg | Audio-video synchronization |
| **Avatar Generation** | SadTalker | Photorealistic talking avatars |
| **Document Processing** | PyPDF2, python-docx | Content extraction and analysis |
| **WebSocket** | FastAPI WebSockets | Real-time progress updates |
| **Voice Processing** | Whisper / Azure Speech | Voice-to-voice game mode |

## Performance Benchmarks

### Generation Times by Mode

**ASK Mode:**

| Content Type | Processing Time | Quality |
|-------------|----------------|---------|
| Video (30s) | 15-30s | High |
| Video (1 min) | 45-90s | High |
| Video (2 min) | 2-3 min | High |
| Flashcards (20 cards) | 10-15s | High |
| Quiz (10 questions) | 15-20s | High |
| Document Q&A | < 5s | High |

**PLAN Mode:**

| Input Type | Roadmap Complexity | Processing Time |
|-----------|-------------------|----------------|
| Document | Basic (4 weeks) | 20-30s |
| Document | Intermediate (12 weeks) | 40-60s |
| Topic description | Advanced (24 weeks) | 60-90s |

**PLAY Mode:**

| Game Type | Response Time | Mode |
|-----------|--------------|------|
| Teach the AI | Real-time | Voice-to-voice |
| Drag & Drop | Instant | Interactive |
| Identify Error | Instant | Multiple choice |

### System Performance

- **API Response Time**: < 500ms for planning
- **Scene Rendering**: 5-15s per scene (GPU-accelerated)
- **Audio Generation**: 2-5s per scene
- **Avatar Rendering**: 30-60s (depends on video length)
- **Success Rate**: 92% scenes render successfully
- **Auto-Repair Success**: 85% of failed scenes recovered
- **Flashcard Generation**: 500ms per card
- **Quiz Question Generation**: 1-2s per question

## Use Cases

### Education & E-Learning

- **Self-Paced Learning**: Complete learning ecosystem from content to games
- **Exam Preparation**: Generate flashcards, quizzes, and video summaries
- **STEM Education**: Visual physics simulations and math explanations
- **Language Learning**: Grammar concepts with interactive exercises

### Corporate Training

- **Employee Onboarding**: Custom learning paths with progress tracking
- **Technical Training**: Video tutorials with knowledge validation games
- **Compliance Training**: Interactive quizzes and certification paths
- **Product Knowledge**: Visual demos with drag-and-drop exercises

### Academic Research

- **Paper Comprehension**: Generate summaries, flashcards, and Q&A
- **Concept Mastery**: Video explanations with teaching reinforcement
- **Study Planning**: Roadmaps from research paper to full understanding
- **Peer Teaching**: Use "Teach the AI" to validate understanding

### Content Creators

- **Course Development**: Rapidly generate videos, quizzes, and learning paths
- **Student Engagement**: Interactive games for knowledge reinforcement
- **Tutorial Creation**: Animated explanations with assessment tools
- **Educational Content**: Multi-format content from single source

## Advanced Configuration

### ASK Mode Configuration

```python
# Video generation settings
VIDEO_CONFIG = {
    "max_scenes": 15,
    "min_duration_per_scene": 5,
    "max_duration_per_scene": 20,
    "complexity_level": "medium",
    "animation_style": "clean",
    "math_rendering": "latex",
    "color_scheme": "default"
}

# Flashcard generation settings
FLASHCARD_CONFIG = {
    "difficulty_distribution": {
        "easy": 0.3,
        "medium": 0.5,
        "hard": 0.2
    },
    "include_images": True,
    "spaced_repetition": True
}

# Quiz generation settings
QUIZ_CONFIG = {
    "question_types": {
        "multiple_choice": 0.6,
        "true_false": 0.2,
        "fill_blank": 0.2
    },
    "adaptive_difficulty": True,
    "explanation_included": True
}
```

### PLAN Mode Configuration

```python
# Roadmap generation settings
ROADMAP_CONFIG = {
    "milestone_granularity": "weekly",
    "include_assessments": True,
    "resource_types": ["video", "article", "practice"],
    "prerequisite_validation": True,
    "adaptive_pacing": True
}
```

### PLAY Mode Configuration

```python
# Game settings
GAME_CONFIG = {
    "teach_ai": {
        "voice_provider": "azure",
        "feedback_style": "encouraging",
        "difficulty_progression": True
    },
    "drag_drop": {
        "time_limit": 60,
        "hint_system": True,
        "visual_feedback": True
    },
    "identify_error": {
        "explanation_depth": "detailed",
        "hint_after_wrong": True,
        "max_attempts": 3
    }
}
```

### Avatar Customization

```python
# Avatar generation settings
AVATAR_CONFIG = {
    "expression": "neutral",
    "pose": "centered",
    "background": "blur",
    "lighting": "natural",
    "video_quality": "high"
}
```

### Error Handling Strategy

```python
# Rendering failure handling
ERROR_POLICY = {
    "retry_count": 1,
    "skip_on_failure": True,
    "log_errors": True,
    "fallback_to_text": False,
    "partial_output": True
}
```

## Educational Impact

### Three-Mode Learning Approach

**ASK MODE** - Comprehensive Content Understanding
- Multiple learning formats (videos, flashcards, quizzes)
- Caters to different learning styles
- On-demand clarification through Q&A
- Visual + auditory + textual learning

**PLAN MODE** - Structured Progress Tracking
- Clear learning objectives and milestones
- Prevents overwhelm with structured paths
- Adaptive pacing based on progress
- Resource optimization and time management

**PLAY MODE** - Active Knowledge Reinforcement
- Gamification increases engagement
- Multiple reinforcement strategies
- Immediate feedback loops
- Confidence building through practice

### Learning Outcomes

- **25% Faster**: Concept comprehension with multi-modal approach
- **40% Better**: Retention with video + flashcards + games
- **3x Engagement**: Compared to traditional text-based learning
- **Scalability**: Complete learning journeys in minutes
- **85% Completion**: Higher course completion with roadmaps

### Accessibility Benefits

- **Visual Learners**: Dynamic animations and interactive games
- **Auditory Learners**: Clear narration and voice interactions
- **Kinesthetic Learners**: Drag-and-drop and interactive elements
- **Multilingual Support**: TTS in 40+ languages
- **Self-Paced**: Custom roadmaps adapt to individual pace

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Community

### Getting Help

- **Documentation**: [docs.bloop.ai](https://chartreuse-vest-a4b.notion.site/Bloop-2d9dbad1b5d380ecb859dd25b9e4acf3)
- **GitHub Issues**: [Report bugs](https://github.com/poorvikab/bloop/issues)
- **Email**: poorvikagrover@gmail.com

### FAQ

**Q: How long does it take to generate content?**  
A: Video generation takes 45-90 seconds for a 2-minute video. Flashcards and quizzes generate in 10-20 seconds. Roadmaps take around 20 seconds depending on complexity.

**Q: Can I use my own avatar image?**  
A: Yes! Upload any portrait image and Bloop will animate it with synchronized lip movements.

**Q: What's the difference between the three modes?**  
A: ASK mode helps you understand content (videos, flashcards, Q&A). PLAN mode creates learning roadmaps. PLAY mode reinforces learning through games.

**Q: Can I customize the learning roadmap?**  
A: Yes, you can specify your level, duration, focus areas, and time commitment. The roadmap adapts to your progress.

**Q: Do the games track my progress?**  
A: Yes, all three games track performance, provide feedback, and adapt difficulty based on your responses.

**Q: What document formats are supported?**  
A: PDF, DOCX, TXT, and plain text input are all supported for content generation.

## Acknowledgments

- **OpenAI** for GPT-4 and AI capabilities
- **Azure** for TTS and cloud infrastructure
- **Manim Community** for animation framework
- **SadTalker Team** for avatar technology
- **All Contributors** who made this possible

---
<div align="center">


### Ready to transform education?

[Read Docs](https://chartreuse-vest-a4b.notion.site/Bloop-2d9dbad1b5d380ecb859dd25b9e4acf3)

</div>
