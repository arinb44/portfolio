"""Count near-duplicate consecutive frames in a video (checks that a 24 fps cut kept every real frame once)."""
import subprocess, sys, numpy as np
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', 'scale=160:90', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True, check=True).stdout
d = np.abs(np.diff(np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32), axis=0)).mean((1, 2))
print(sys.argv[1], 'frames', len(d) + 1, 'duplicates', int((d < .5).sum()))
