# 08_encode.py
# Purpose: Frames + black to the end + the sound mix -> H.264/AAC MP4 at 24 fps, then check it with
#          ffprobe (duration, frame count, both streams). Rendered frames stop at LAST_PICTURE;
#          the rest of the 600 frames are black, so the sound carries on over the cut.
# Input:   PNGs named <name>_####.png (frames 1..LAST_PICTURE) in --src, audio/escape_mix.wav
# Output:  --out (.mp4)
# Run:     python -I scripts/08_encode.py --src final/frames --name escape --out final/escape.mp4
#          python -I scripts/08_encode.py --src previews/m3-animation/full --name f --out previews/m3-animation/preview.mp4
import argparse
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--src", required=True)
ap.add_argument("--name", default="escape")
ap.add_argument("--out", required=True)
ap.add_argument("--audio", default=f"{C.ROOT}/audio/escape_mix.wav")
ap.add_argument("--crf", type=int, default=18)
a = ap.parse_args()
src = os.path.abspath(a.src)
missing = [f for f in range(1, C.LAST_PICTURE + 1) if not os.path.exists(f"{src}/{a.name}_{f:04d}.png")]
assert not missing, f"{len(missing)} frames missing, first {missing[:5]}"
pad = C.N - C.LAST_PICTURE
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
cmd = ["ffmpeg", "-v", "error", "-y", "-framerate", str(C.FPS), "-start_number", "1",
       "-i", f"{src}/{a.name}_%04d.png", "-i", a.audio,
       "-vf", f"tpad=stop={pad}:stop_mode=add:color=black,format=yuv420p",
       "-frames:v", str(C.N), "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf), "-movflags", "+faststart",
       "-c:a", "aac", "-b:a", "192k", "-t", f"{C.N / C.FPS:.3f}", a.out]
subprocess.run(cmd, check=True)

probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", a.out],
                                  check=True, capture_output=True, text=True).stdout)
v = next(s for s in probe["streams"] if s["codec_type"] == "video")
au = next(s for s in probe["streams"] if s["codec_type"] == "audio")
dur = float(probe["format"]["duration"])
assert int(v["nb_read_frames"]) == C.N, f"video has {v['nb_read_frames']} frames"
assert abs(dur - C.N / C.FPS) < 0.06, f"duration {dur}"
print(f"ENCODED {a.out}: {v['width']}x{v['height']} {v['codec_name']} {v['nb_read_frames']} frames @ {v['r_frame_rate']}, "
      f"{au['codec_name']} {au['sample_rate']} Hz {au['channels']} ch, {dur:.2f} s, {os.path.getsize(a.out) / 1e6:.1f} MB")
