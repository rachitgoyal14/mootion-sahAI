import json
import subprocess
from pathlib import Path
import re
import shutil

from utils.llm import call_llm
from utils.json_safe import extract_json
from utils.timestamps_extractor import extract_timestamps

# ============================================================
# PATHS (ABSOLUTE, SINGLE SOURCE OF TRUTH)
# ============================================================

# This file: app/stages/stage2_manim.py
PROJECT_ROOT = Path(__file__).resolve().parents[2]

APP_DIR = PROJECT_ROOT / "app"
PROMPTS_DIR = APP_DIR / "prompts"

MEDIA_DIR = PROJECT_ROOT / "media"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"

ANIMATION_PY = OUTPUTS_DIR / "animation.py"
TIMESTAMPS_JSON = OUTPUTS_DIR / "timestamps.json"
SCENES_OUT_DIR = OUTPUTS_DIR / "scenes"

# ============================================================
# REGEX
# ============================================================

SCENE_CLASS_RE = re.compile(
    r"class\s+(Scene\d+_[A-Za-z0-9_]+)\s*\(Scene\)"
)

# ============================================================
# HELPERS
# ============================================================

def extract_scene_classes(manim_code: str):
    return SCENE_CLASS_RE.findall(manim_code)


def clean_manim_temp():
    """Remove ALL manim temporary artifacts."""
    for p in [
        MEDIA_DIR / "videos",
        MEDIA_DIR / "Tex",
        MEDIA_DIR / "text",
        MEDIA_DIR / "images",
    ]:
        shutil.rmtree(p, ignore_errors=True)


def render_scene(scene_class_name: str):
    """Render exactly ONE scene."""
    subprocess.run(
        [
            "manim",
            "-ql",
            str(ANIMATION_PY),
            scene_class_name,
        ],
        cwd=PROJECT_ROOT,  # 🔥 CRITICAL: prevents app/media
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def extract_scene_video(scene_class_name: str, scene_id: str, index: int):
    """Move rendered scene video from media/ → outputs/scenes/"""
    candidates = list(MEDIA_DIR.rglob(f"{scene_class_name}.mp4"))

    if not candidates:
        raise RuntimeError(f"No video found for {scene_class_name}")

    SCENES_OUT_DIR.mkdir(parents=True, exist_ok=True)

    dst = SCENES_OUT_DIR / f"{index:02d}_{scene_id}.mp4"
    shutil.move(candidates[0], dst)

    print(f"🎬 Saved → {dst}")
    return dst


def fix_manim_code_with_llm(manim_code: str, error: str) -> str:
    prompt = f"""
You are an expert Manim debugger.

Rules:
- Fix ONLY runtime or syntax errors
- Do NOT rename Scene classes
- Do NOT add or remove scenes
- Return ONLY valid Python code
- Do NOT include markdown
- Do NOT include explanations

Broken Manim code:
{manim_code}

Error:
{error}
"""
    output = call_llm(prompt)
    return output.strip()


MAX_RETRIES = 2

def generate_manim(scenes):
# ---------- Generate Manim code ----------
    scenes_json = json.dumps(scenes)
    scenes_category = scenes["category"]
    prompt_path = PROMPTS_DIR / f"{scenes_category.lower()}_manim.txt"
    prompt = prompt_path.read_text(encoding="utf-8").replace(
        "{scenes_json}", scenes_json
    )

    output = call_llm(prompt)
    data = extract_json(output)
    manim_code = data["manim_code"]

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    ANIMATION_PY.write_text(manim_code)

    # ---------- Timestamps ----------
    timestamps = extract_timestamps(manim_code)
    TIMESTAMPS_JSON.write_text(json.dumps(timestamps, indent=2))

    # ---------- Scene validation ----------
    scene_classes = extract_scene_classes(manim_code)
    if len(scene_classes) != len(scenes["scenes"]):
        raise RuntimeError("Scene count mismatch between JSON and Manim code")

    final_scene_ids = []

    # ---------- Per-scene rendering ----------
    for idx, scene_class in enumerate(scene_classes, start=1):
        scene_id = f"scene_{idx}"
        retries = 0

        while retries <= MAX_RETRIES:
            try:
                clean_manim_temp()
                render_scene(scene_class)
                extract_scene_video(scene_class, scene_id, idx)
                final_scene_ids.append(scene_id)
                print(f"✅ Rendered {scene_class}")
                break

            except (subprocess.CalledProcessError, RuntimeError) as e:

                retries += 1

                print("\n" + "=" * 80)
                print(f"❌ Manim error in {scene_class} (attempt {retries}/{MAX_RETRIES})")
                print("-" * 80)
                print(e.stderr)
                print("=" * 80)

                if retries <= MAX_RETRIES:
                    fixed_code = fix_manim_code_with_llm(manim_code, e.stderr)

                    print("\n🛠 LLM FIX APPLIED (preview):")
                    print("-" * 80)
                    print("\n".join(fixed_code.splitlines()[:30]))
                    print("-" * 80)

                    manim_code = fixed_code
                    ANIMATION_PY.write_text(manim_code)
                else:
                    print(f"🗑 Skipping {scene_class}")
                    break


    return {
        "manim_code": manim_code,
        "timestamps": timestamps,
        "scene_ids": final_scene_ids,
    }


def clean_manim_output():
    video_dir = Path("media/videos/animation/480p15")
    video_dir.mkdir(parents=True, exist_ok=True)

    for f in video_dir.glob("*.mp4"):
        f.unlink()

