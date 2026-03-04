from __future__ import annotations

from datetime import datetime
from typing import Any

STAGES = ["hook", "discovery", "evolution", "application", "future"]


def build_topic_outline(topic: str, goal: str, level: str | None = None) -> dict[str, Any]:
    """Create a structured teaching outline that stays specific to the learner's topic."""
    level_text = level or "intermediate"

    return {
        "title": f"{topic}: {goal}",
        "audience": f"{level_text.title()} learners",
        "slides": [
            {
                "heading": f"What is {topic}?",
                "bullets": [
                    f"Clear definition of {topic} in plain language",
                    f"Why {topic} is essential to {goal.lower()}",
                    "One misconception to avoid from the start",
                ],
                "narration": (
                    f"Let's ground ourselves in what {topic} really means. "
                    f"You'll learn the core idea first, then apply it toward {goal.lower()}."
                ),
                "imagePrompt": f"Clean educational slide explaining {topic} with labeled visual metaphor",
            },
            {
                "heading": f"Core building blocks of {topic}",
                "bullets": [
                    "Key terms and symbols you must recognize",
                    "Step-by-step process for solving basic tasks",
                    "How each building block connects to the full concept",
                ],
                "narration": (
                    f"Now we break {topic} into manageable pieces. "
                    "Master these building blocks and advanced problems become much easier."
                ),
                "imagePrompt": f"Diagram of key building blocks and relationships within {topic}",
            },
            {
                "heading": f"Worked example: {topic}",
                "bullets": [
                    "Solve one representative problem from start to finish",
                    "Explain each step and the reasoning behind it",
                    "Highlight common mistakes and quick checks",
                ],
                "narration": (
                    "Examples convert theory into skill. "
                    f"We'll solve a realistic {topic} problem and show how experts think through it."
                ),
                "imagePrompt": f"Step-by-step worked example board for {topic}, clean and readable",
            },
            {
                "heading": f"Real-world use of {topic}",
                "bullets": [
                    f"How {topic} appears in technology, science, or daily decisions",
                    "A practical scenario where this concept changes outcomes",
                    f"How this supports your goal: {goal}",
                ],
                "narration": (
                    f"This is where {topic} becomes meaningful. "
                    "You'll see concrete applications and why the concept matters beyond exams."
                ),
                "imagePrompt": f"Modern real-world application of {topic} in action",
            },
            {
                "heading": f"Mastery roadmap for {topic}",
                "bullets": [
                    "Practice plan for the next 7 days",
                    "Signals that you truly understand the concept",
                    "What to learn next after this topic",
                ],
                "narration": (
                    "To finish, you'll get a clear practice roadmap. "
                    "Consistency and feedback loops are the fastest path to mastery."
                ),
                "imagePrompt": f"Learning roadmap timeline for mastering {topic}",
            },
        ],
    }


def build_video_outline(concept_id: str, title: str, description: str) -> dict[str, Any]:
    desc = description.strip().rstrip(".")
    slides = [
        {
            "stage": "hook",
            "heading": f"Why {title} matters right now",
            "narration": (
                f"{title} is not just theory. {desc}. "
                "In the next few minutes, you'll see why this idea is powerful and worth learning."
            ),
            "imagePrompt": f"Attention-grabbing educational visual showing impact of {title}",
        },
        {
            "stage": "discovery",
            "heading": f"How {title} was discovered",
            "narration": (
                f"The concept of {title} emerged because people needed better ways to reason and solve hard problems. "
                "Understanding this origin helps you remember the concept's purpose."
            ),
            "imagePrompt": f"Historical scene of mathematicians discovering {title}",
        },
        {
            "stage": "evolution",
            "heading": f"How understanding of {title} evolved",
            "narration": (
                f"Over time, {title} evolved from a simple idea into a robust framework. "
                "Each refinement made it more useful for real analysis and decision-making."
            ),
            "imagePrompt": f"Timeline graphic of the evolution of {title}",
        },
        {
            "stage": "application",
            "heading": f"Real applications of {title}",
            "narration": (
                f"Today, {title} powers practical work in engineering, computing, science, and finance. "
                "When you can model these scenarios, your problem-solving ability jumps to a new level."
            ),
            "imagePrompt": f"Practical modern applications of {title} in multiple industries",
        },
        {
            "stage": "future",
            "heading": f"The future of {title}",
            "narration": (
                f"The future of {title} includes deeper integration with AI, simulation, and emerging technologies. "
                "Learners who master it now will be prepared for high-impact roles."
            ),
            "imagePrompt": f"Futuristic visualization of next-generation uses of {title}",
        },
    ]

    return {
        "title": f"The Story of {title}",
        "conceptId": concept_id,
        "slides": slides,
        "estimatedDuration": 90,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
    }
