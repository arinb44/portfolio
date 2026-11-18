# 05_audio.py
# Purpose: M4 sound. Mixes the 25 s track from cues.json (written by 04_animation.py): night
#          ambience and wind, the wendigo's scream, the hunter's footsteps on every footstrike, a
#          synthesized panting breath in time with the stride, whooshes on the head turns, the
#          wendigo's footsteps placed, panned and muffled by its real distance and direction, the
#          trip and the fall, and the wendigo arriving over the black. No music.
# Sources: Game 2 sounds (free for public use, per the user), decoded by ffmpeg into audio/src/.
# Input:   output/nightfall-escape/cues.json
# Output:  output/nightfall-escape/audio/escape_mix.wav (48 kHz, stereo, 16-bit)
# Run:     python -I scripts/05_audio.py        (system Python with numpy; ffmpeg on PATH)
import json
import math
import os
import subprocess
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

SR = 48000
SRC = f"{C.ROOT}/audio/src"
SOURCES = {  # short name: file in Game 2/audio
    "steps_dirt": "footsteps-dirt-gravel-6823-[AudioTrimmer.com].mp3",
    "monster_steps": "monster-footstep-162883.mp3",
    "night": "soundtracks/night-ambience-17064.mp3",
    "howl_wind": "047865_howl-whistle-66102.mp3",
    "scream_echo": "scream-with-echo-46585.mp3",
    "scream_demonic": "demonic-woman-scream-6333-[AudioTrimmer.com]-[AudioTrimmer.com].mp3",
    "collapse": "collapsing-in-grass-101312.mp3",
    "whoosh": "movement-swipe-whoosh-3-186577.mp3",
    "flash_click": "flashlight-click-46073.mp3",
}
rng = np.random.default_rng(25)
cues = json.load(open(f"{C.ROOT}/cues.json"))
FPS, N = cues["fps"], cues["frames"]
LEN = int(round(N / FPS * SR))
mix = np.zeros((LEN, 2))


def t_of(frame):
    return (frame - 1) / FPS


def db(x):
    return 10 ** (x / 20)


def load(name):
    path = f"{SRC}/{name}.wav"
    if not os.path.exists(path):
        os.makedirs(SRC, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{C.GAME_AUDIO}/{SOURCES[name]}", "-ar", str(SR), "-ac", "2",
                        "-c:a", "pcm_f32le", path], check=True)
    b = open(path, "rb").read()
    i = b.index(b"data") + 8
    return np.frombuffer(b[i:i + (len(b) - i) // 8 * 8], dtype="<f4").reshape(-1, 2).astype(np.float64)


def cut(x, a, b, fade=0.006):
    y = x[int(a * SR):int(b * SR)].copy()
    n = int(fade * SR)
    ramp = np.linspace(0, 1, n)[:, None]
    y[:n] *= ramp
    y[-n:] *= ramp[::-1]
    return y


def norm(x, peak_db=0.0):
    return x * db(peak_db) / (np.abs(x).max() + 1e-12)


def filt(x, lo=None, hi=None):
    """Gentle 2nd-order-like high/low cut, done in the frequency domain (offline, so no phase worries)."""
    n = len(x)
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(n, 1 / SR) + 1e-3
    g = np.ones_like(f)
    if hi:
        g /= np.sqrt(1 + (f / hi) ** 4)
    if lo:
        g /= np.sqrt(1 + (lo / f) ** 4)
    return np.fft.irfft(X * g[:, None], n, axis=0)


def speed(x, rate):
    """Vari-speed: rate > 1 is higher and shorter."""
    n = int(len(x) / rate)
    src = np.arange(n) * rate
    return np.stack([np.interp(src, np.arange(len(x)), x[:, c]) for c in (0, 1)], axis=1)


def pan(x, p):
    """Equal-power pan of a (mono-summed) sound, p in -1 (left) .. 1 (right)."""
    m = x.mean(axis=1)
    a = (p + 1) * math.pi / 4
    return np.stack([m * math.cos(a), m * math.sin(a)], axis=1)


def reverb(x, seconds=1.3, wet_db=-12.0, hi=3500):
    """Forest-ish tail: convolve with decaying, decorrelated, darkened noise."""
    n = int(seconds * SR)
    env = np.exp(-6.9 * np.arange(n) / n)[:, None]
    ir = filt(rng.standard_normal((n, 2)) * env, lo=150, hi=hi)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    m = len(x) + n - 1
    size = 1 << (m - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x.mean(axis=1), size)[:, None] * np.fft.rfft(ir, size, axis=0), size, axis=0)[:m]
    out = np.zeros((m, 2))
    out[:len(x)] += x
    return out + wet * db(wet_db)


def place(x, t, gain_db=0.0):
    """Add x into the mix starting at time t (seconds); clipped to the track."""
    i = int(round(t * SR))
    if i >= LEN:
        return
    j0 = max(0, -i)
    i = max(0, i)
    n = min(len(x) - j0, LEN - i)
    if n > 0:
        mix[i:i + n] += x[j0:j0 + n] * db(gain_db)


def pose(frame):
    f = str(int(min(max(round(frame), 1), N)))
    return cues["pose"][f]


def azimuth(frame):
    """Wendigo's direction relative to where the camera looks: 0 ahead, +90 left, 180 behind."""
    cx, cy, cz, yaw, wx, wy = pose(frame)
    to = math.degrees(math.atan2(-(wx - cx), wy - cy))
    return (to - yaw + 180) % 360 - 180, math.hypot(wx - cx, wy - cy)


def az_pan(az):
    return max(-1.0, min(1.0, -math.sin(math.radians(az)) * 0.8))


# --- synthesized sounds -----------------------------------------------------------------------
def breath(dur, kind, effort):
    """Breath noise shaped by a few formants; exhales get a little voice when the effort is high."""
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    X = np.fft.rfft(noise)
    f = np.fft.rfftfreq(n, 1 / SR)
    jit = rng.uniform(0.9, 1.1)
    forms = [(1900, 700, 1.0), (3600, 1100, 0.6), (900, 400, 0.35)] if kind == "in" else \
            [(650, 280, 1.0), (1250, 450, 0.75), (2600, 900, 0.45)]
    shape = sum(a * np.exp(-0.5 * ((f - fc * jit) / bw) ** 2) for fc, bw, a in forms) + 0.03
    y = np.fft.irfft(X * shape, n)
    if kind == "out" and effort > 0.6:  # a breathy voiced edge: a soft pulse train through the same formants
        f0 = rng.uniform(105, 130)
        tt = np.arange(n) / SR
        pulses = np.sin(math.tau * f0 * tt) ** 9
        vy = np.fft.irfft(np.fft.rfft(pulses) * shape, n)
        y = y / (np.abs(y).max() + 1e-9) + 0.35 * (effort - 0.6) * vy / (np.abs(vy).max() + 1e-9)
    tt = np.linspace(0, 1, n)
    a = 0.18 if kind == "in" else 0.08
    env = np.clip(tt / a, 0, 1) ** 1.5 * np.clip((1 - tt) / 0.55, 0, 1) ** 1.3
    y = y * env
    y = y / (np.abs(y).max() + 1e-9)
    st = np.stack([y, np.roll(y, 9)], axis=1)  # a touch of width: it's inside the head
    return st * (0.55 + 0.45 * effort)


def thump(dur=0.09, f0=68.0):
    tt = np.arange(int(dur * SR)) / SR
    y = np.sin(math.tau * f0 * tt * (1 - 0.3 * tt / dur)) * np.exp(-tt / 0.025)
    return np.stack([y, y], axis=1)


# --- beds: night ambience and a far howl of wind --------------------------------------------
night = load("night")
bed = cut(night, 1.0, 1.0 + N / FPS + 0.2, fade=0.5)
bed = norm(bed, -24) * 1.0
place(bed, 0.0, -6.0)
howl = filt(load("howl_wind"), lo=200, hi=2500)
place(norm(cut(howl, 0.5, 14.5, fade=1.5), -30.0), 4.0)

# --- the scream that starts it (front right, ~7.5 m) -----------------------------------------
az, d = azimuth(8)
scream = reverb(filt(load("scream_demonic"), hi=7000), seconds=1.6, wet_db=-8)
place(pan(norm(scream, -3.0), az_pan(az)), t_of(cues["scream"][0] + 6))

# --- hunter footsteps --------------------------------------------------------------------------
dirt = load("steps_dirt")
step_a, step_b = norm(cut(dirt, 0.04, 0.37), 0), norm(cut(dirt, 0.39, 0.71), 0)
for i, fr in enumerate(cues["hunter_steps"]):
    v = cues["speed"][str(int(fr))] / C.SPRINT
    s = speed(step_a if rng.random() < 0.5 else step_b, rng.uniform(0.88, 1.12))
    s = pan(s, 0.15 if i % 2 else -0.15)  # left foot, right foot
    g = -12.0 + 6.0 * min(v, 1.0) + rng.uniform(-2, 2)
    place(s, t_of(fr), g)
    place(thump(f0=rng.uniform(58, 78)), t_of(fr), g - 4.0)
# the caught foot: a scuff and a knock on the root
place(pan(speed(step_a, 0.8), 0.1), t_of(cues["trip"]), -5.0)
place(thump(0.12, 95.0), t_of(cues["trip"]) + 0.01, -8.0)

# --- breathing ---------------------------------------------------------------------------------
look_spans = [(a, b) for a, b, _ in cues["lookbacks"]]
place(breath(0.32, "in", 0.9), t_of(cues["scream"][0] + 7), -12)       # a gasp at the scream
place(breath(0.45, "out", 0.4), t_of(33), -19)                         # a shaky breath out, frozen
place(breath(0.3, "in", 1.0), t_of(cues["turn"][0] + 1), -11)         # and in, as it turns to run
steps = cues["hunter_steps"]
last = steps[-1]
for i, fr in enumerate(steps[1:], start=1):
    if any(a <= fr <= a + 18 for a, b in look_spans):
        continue  # the gasp at a look-back takes over
    effort = 0.55 + 0.45 * min(1.0, (fr - steps[0]) / (last - steps[0]))
    kind = "out" if i % 2 == 0 else "in"
    dur = (0.3 if kind == "out" else 0.24) * rng.uniform(0.9, 1.1)
    place(breath(dur, kind, effort), t_of(fr) + 0.02, -15 + 3 * effort)
for a, b in look_spans:
    place(breath(0.34, "in", 1.0), t_of(a + 1), -10)                    # sharp intake at what it sees

# --- head turns --------------------------------------------------------------------------------
whoosh = filt(load("whoosh"), hi=6000)
place(pan(whoosh, 0.2), t_of(cues["turn"][0]) - 0.1, -12)
for a, b, sh in cues["lookbacks"]:
    p = -0.35 if sh == "L" else 0.35
    place(pan(whoosh, p), t_of(a) - 0.12, -14)
    place(pan(speed(whoosh, 1.15), -p), t_of(b - 8) - 0.1, -19)

# --- wendigo footsteps, placed by distance and direction ---------------------------------------
mon = load("monster_steps")
peaks = [2.23, 2.6, 4.11, 4.67, 6.2, 6.74, 8.3, 8.76, 11.57, 12.3, 12.8]
w_steps = [norm(cut(mon, p - 0.04, p + 0.34), 0) for p in peaks]
for fr in cues["wendigo_steps"]:
    az, d = azimuth(fr)
    g = 20 * math.log10((3.0 / (d + 3.0)) ** 1.3) - 1.0
    s = filt(speed(w_steps[rng.integers(len(w_steps))], rng.uniform(0.9, 1.05)), hi=9000 / (1 + d / 4))
    if abs(az) > 110:
        s = filt(s, hi=4000)  # behind the head: duller
    place(pan(s, az_pan(az)), t_of(fr), g)

# --- trip, fall, the flashlight hitting the floor ---------------------------------------------
place(breath(0.18, "out", 1.0), t_of(cues["trip"] + 1), -7)            # "uh" as the foot catches
fall = load("collapse")
place(norm(cut(fall, 0.6, 2.4), -2.0), t_of(cues["impact"]) - 0.3)    # its main hit (0.9 s) on the impact
place(thump(0.16, 52.0), t_of(cues["impact"]), -3.0)
place(norm(load("flash_click"), -12.0), t_of(cues["flashlight_release"] + 2))
place(breath(0.26, "out", 1.0), t_of(cues["impact"] + 1), -9)          # the wind knocked out
place(breath(0.42, "in", 0.9), t_of(cues["impact"] + 8), -13)          # a ragged breath on the ground

# --- over the black: it arrives ---------------------------------------------------------------
end_scream = reverb(filt(load("scream_echo"), hi=9000), seconds=1.0, wet_db=-14)
end_scream = cut(end_scream, 0.08, 0.08 + (590 - 572) / FPS, fade=0.02)  # cut off mid-scream
place(norm(end_scream, -1.5), t_of(572))
# everything stops with it: fade the beds out under the scream, then silence
i0, i1 = int(t_of(588) * SR), int(t_of(591) * SR)
mix[i1:] = 0.0
mix[i0:i1] *= np.linspace(1, 0, i1 - i0)[:, None]

# --- master: soft limit to -1 dBFS, write 16-bit ---------------------------------------------
peak = np.abs(mix).max()
mix_n = mix / peak * db(-0.5)
mix_n = np.tanh(mix_n * 1.4) / np.tanh(1.4) * db(-1.0)
out = (np.clip(mix_n, -1, 1) * 32767).astype("<i2")
os.makedirs(f"{C.ROOT}/audio", exist_ok=True)
with wave.open(f"{C.ROOT}/audio/escape_mix.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out.tobytes())

# --- report and self-check ----------------------------------------------------------------------
x = out.astype(np.float64) / 32767
assert len(x) == LEN == round(N / FPS * SR), "track length"
assert np.abs(x[int(t_of(592) * SR):]).max() < 1e-3, "the end should be silent"
win = SR // 10
rms = [20 * math.log10(math.sqrt((x[k:k + win] ** 2).mean()) + 1e-9) for k in range(0, LEN - win, win)]
print(f"mix {LEN / SR:.2f} s, peak {20 * math.log10(np.abs(x).max()):.1f} dBFS, "
      f"overall rms {20 * math.log10(math.sqrt((x ** 2).mean())):.1f} dBFS, "
      f"{len(cues['hunter_steps'])} hunter steps, {len(cues['wendigo_steps'])} wendigo steps")
print("rms per second:", " ".join(f"{max(rms[k:k + 10]):.0f}" for k in range(0, len(rms), 10)))
