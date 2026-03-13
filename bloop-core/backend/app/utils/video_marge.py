import subprocess

def merge_side_by_side(
    left_video: str,
    right_video: str,
    output_video: str
):
    """
    Side-by-side merge:
    Left  -> Manim animation
    Right -> SadTalker avatar
    """

    cmd = [
        "ffmpeg", "-y",
        "-i", left_video,
        "-i", right_video,
        "-filter_complex",
        # Normalize height, then stack horizontally
        "[0:v]scale=-1:720[left];"
        "[1:v]scale=-1:720[right];"
        "[left][right]hstack=inputs=2[v]",
        "-map", "[v]",
        "-map", "1:a?",   # Use SadTalker audio
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "fast",
        output_video
    ]

    subprocess.run(cmd, check=True)
