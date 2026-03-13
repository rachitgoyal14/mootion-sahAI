import subprocess

def get_duration(file):
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            file
        ],
        stdout=subprocess.PIPE,
        text=True
    )
    return float(result.stdout.strip())

video = "video.mp4"
audio = "audio.wav"
output = "final.mp4"

video_dur = get_duration(video)
audio_dur = get_duration(audio)

factor = audio_dur / video_dur

subprocess.run([
    "ffmpeg", "-y",
    "-i", video,
    "-i", audio,
    "-filter_complex", f"[1:a]atempo={factor}[a]",
    "-map", "0:v",
    "-map", "[a]",
    "-c:v", "copy",
    "-shortest",
    output
], check=True)
