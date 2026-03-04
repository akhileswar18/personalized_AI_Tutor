from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.content import build_topic_outline, build_video_outline


class OutlineRequest(BaseModel):
    topic: str = Field(min_length=1)
    goal: str = Field(min_length=1)
    level: str | None = None


class Slide(BaseModel):
    heading: str
    imagePrompt: str | None = None


class SlidesRequest(BaseModel):
    slides: list[Slide]


class TTSRequest(BaseModel):
    script: str = Field(min_length=1)
    voice: str | None = None


class VideoRequest(BaseModel):
    imageFiles: list[str]
    audioFile: str
    perSlideSeconds: list[int | float]


class ConceptRequest(BaseModel):
    conceptId: str
    conceptTitle: str
    conceptDescription: str


class AssembleRequest(BaseModel):
    conceptId: str
    images: list[str]
    audioFiles: list[str]
    slides: list[dict[str, Any]]


app = FastAPI(title="Personalized AI Tutor API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/api/outline")
def outline(req: OutlineRequest) -> dict[str, Any]:
    return build_topic_outline(req.topic, req.goal, req.level)


@app.post("/api/slides")
def slides(req: SlidesRequest) -> dict[str, list[str]]:
    image_urls = [
        f"https://via.placeholder.com/1920x1080/0f172a/38bdf8?text={i+1}:{slide.heading.replace(' ', '+')[:60]}"
        for i, slide in enumerate(req.slides)
    ]
    return {"images": image_urls}


@app.post("/api/tts")
def tts(req: TTSRequest) -> dict[str, str]:
    # Stubbed to keep project runnable without paid providers.
    return {"audioFile": "/assets/audio/narration.mp3", "voice": req.voice or "neutral"}


@app.post("/api/video")
def video(req: VideoRequest) -> dict[str, str]:
    if not (len(req.imageFiles) and len(req.perSlideSeconds)):
        raise HTTPException(status_code=400, detail="imageFiles and perSlideSeconds cannot be empty")
    return {"videoUrl": "/assets/presentation.mp4"}


@app.post("/api/generate-video-outline")
def generate_video_outline(req: ConceptRequest) -> dict[str, Any]:
    return build_video_outline(req.conceptId, req.conceptTitle, req.conceptDescription)


@app.post("/api/generate-video-images")
def generate_video_images(req: dict[str, Any]) -> dict[str, list[str]]:
    slides = req.get("slides")
    if not isinstance(slides, list):
        raise HTTPException(status_code=400, detail="slides array is required")
    return {
        "imageUrls": [
            f"https://via.placeholder.com/1920x1080/1e293b/60a5fa?text=Slide+{index+1}"
            for index, _ in enumerate(slides)
        ]
    }


@app.post("/api/generate-video-narration")
def generate_video_narration(req: dict[str, Any]) -> dict[str, list[str]]:
    slides = req.get("slides")
    if not isinstance(slides, list):
        raise HTTPException(status_code=400, detail="slides array is required")
    return {"audioUrls": [f"/assets/audio/slide_{index+1}.mp3" for index, _ in enumerate(slides)]}


@app.post("/api/assemble-video")
def assemble_video(req: AssembleRequest) -> dict[str, str]:
    return {"videoUrl": f"/assets/videos/{req.conceptId}/presentation.mp4"}


assets_dir = Path(os.getenv("ASSETS_DIR", Path.cwd() / "server" / "tmp"))
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
