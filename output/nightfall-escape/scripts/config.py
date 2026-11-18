# config.py
# Purpose: one source of truth for the run: the path, the hunter's speed, the look-backs, the
#          wendigo's distance and the trip. Pure Python (no bpy) so the Blender scripts and the
#          sound mixer all agree on where everything is at every frame.
# Used by: 01_path_forest.py, 02_clutter.py, 03_atmosphere.py, 04_animation.py, 05_audio.py
import math

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-escape"
STALKED_FINAL = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked/final/stalked_final.blend"
BLENDER = "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
GAME_AUDIO = "C:/Users/arins/Arin/School/Game Dev/Game 2/audio"

FPS, N = 24, 600           # 25.0 s
LAST_PICTURE = 560         # frames after this are black (sound carries on)
EYE = 1.7

# --- path: away from the wendigo (Stalked's spot is at bearing -54 deg, 7.5 m), gentle weaves ----
BEARING = 126.0            # degrees, Stalked's convention: 0 = +Y, positive = to the left (-X)
SPACING = 10.0             # metres between control points
OFFSETS = [0, 1.2, -1.0, 2.0, 0.5, -2.0, -0.5, 1.8, 0.0, -1.0]   # sideways weave at each control point
_b = math.radians(BEARING)
U = (-math.sin(_b), math.cos(_b))      # run direction
NRM = (-U[1], U[0])                     # its left-hand side


def _ctrl():
    pts = [(-SPACING * U[0], -SPACING * U[1])]  # phantom point so the path leaves along U
    for i, off in enumerate(OFFSETS):
        pts.append((i * SPACING * U[0] + off * NRM[0], i * SPACING * U[1] + off * NRM[1]))
    last, prev = pts[-1], pts[-2]
    pts.append((2 * last[0] - prev[0], 2 * last[1] - prev[1]))
    return pts


def _catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return tuple(0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
                 for a, b, c, d in zip(p0, p1, p2, p3))


def _build():
    c = _ctrl()
    dense = []
    for i in range(1, len(c) - 2):
        for k in range(200):
            dense.append(_catmull(c[i - 1], c[i], c[i + 1], c[i + 2], k / 200))
    dense.append(c[-2])
    out, s = [(0.0, *dense[0])], 0.0
    for a, b in zip(dense, dense[1:]):
        s += math.dist(a, b)
        out.append((s, *b))
    return out


_DENSE = _build()
LENGTH = _DENSE[-1][0]


def path_point(s):
    """(x, y) at arc length s. Negative s runs back toward the wendigo's spot along -U."""
    if s <= 0:
        return (s * U[0], s * U[1])
    if s >= LENGTH:
        s = LENGTH
    lo, hi = 0, len(_DENSE) - 1
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if _DENSE[mid][0] <= s:
            lo = mid
        else:
            hi = mid
    s0, x0, y0 = _DENSE[lo]
    s1, x1, y1 = _DENSE[hi]
    t = 0.0 if s1 == s0 else (s - s0) / (s1 - s0)
    return (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)


def path_heading(s, ahead=0.5):
    """Yaw in degrees (Stalked's camera convention) of the path direction at s."""
    a, b = path_point(s - ahead), path_point(s + ahead)
    return math.degrees(math.atan2(-(b[0] - a[0]), b[1] - a[1]))


POLY = [path_point(i * 0.5) for i in range(int(LENGTH / 0.5) + 1)]  # coarse polyline for distance tests


def dist_to_path(p, s_min=0.0):
    """Shortest 2D distance from p to the path (from arc length s_min on)."""
    start = max(0, int(s_min / 0.5))
    best = float("inf")
    if s_min < 0:  # include the straight lead-in toward the wendigo's spot
        a, b = path_point(s_min), (0.0, 0.0)
        best = seg_dist(p, a, b)
    for a, b in zip(POLY[start:], POLY[start + 1:]):
        best = min(best, seg_dist(p, a, b))
    return best


def seg_dist(p, a, b):
    abx, aby = b[0] - a[0], b[1] - a[1]
    L2 = abx * abx + aby * aby
    t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / L2))
    return math.hypot(p[0] - (a[0] + abx * t), p[1] - (a[1] + aby * t))


# --- timeline (scene frames, 1-based) ------------------------------------------------------
SCREAM = (1, 46)                    # wendigo screams in Stalked's spot; the hunter freezes
TURN = (38, 60)                     # whip round to the left, away from it
# look-backs: (start, end, shoulder); the head turns ~160 deg and back inside each window
LOOKBACKS = [(150, 186, "L"), (288, 326, "R"), (424, 466, "L")]
TRIP, IMPACT = 540, 555             # root catches the foot; face-first into the ground
SPRINT = 4.3                        # m/s
# hunter's speed (frame, m/s), linear between keys; look-backs slow it a little (below)
V_KEYS = [(1, 0.0), (44, 0.0), (52, 0.5), (64, 2.0), (92, SPRINT), (TRIP, SPRINT),
          (TRIP + 8, 3.0), (IMPACT, 1.0), (LAST_PICTURE, 0.0), (N + 2, 0.0)]
LOOK_SLOW = 0.5                     # m/s lost while looking back
# wendigo's distance behind the hunter along the path (frame, metres), smoothstep between keys
D_KEYS = [(1, 7.5), (46, 7.5), (168, 13.0), (307, 9.0), (445, 5.5), (TRIP, 3.0), (N + 2, 0.6)]


def _lerp_keys(keys, f, smooth=False):
    if f <= keys[0][0]:
        return keys[0][1]
    for (fa, a), (fb, b) in zip(keys, keys[1:]):
        if fa <= f <= fb:
            t = (f - fa) / (fb - fa)
            if smooth:
                t = t * t * (3 - 2 * t)
            return a + (b - a) * t
    return keys[-1][1]


def look_weight(f):
    """0 running forward, 1 fully looking back; eased turns of 8 frames at each end."""
    for a, b, _ in LOOKBACKS:
        if a <= f <= b:
            t = min((f - a) / 8, (b - f) / 8, 1.0)
            return t * t * (3 - 2 * t)
    return 0.0


def speed(f):
    return max(0.0, _lerp_keys(V_KEYS, f) - LOOK_SLOW * look_weight(f))


_S = {}


def s_hunter(f):
    """Arc length the hunter has covered at (possibly fractional) frame f."""
    if not _S:
        s = 0.0
        for k in range(-2, N + 4):
            _S[k] = s
            s += speed(k + 0.5) / FPS
    fl = math.floor(f)
    return _S[fl] + (_S[fl + 1] - _S[fl]) * (f - fl)


def d_wendigo(f):
    return _lerp_keys(D_KEYS, f, smooth=True)


def s_wendigo(f):
    return s_hunter(f) - d_wendigo(f)


def lookback_segments(step=3):
    """(hunter xy, wendigo xy) pairs through every look-back, for keeping sight lines clear."""
    out = []
    for a, b, _ in LOOKBACKS:
        for f in range(a, b + 1, step):
            out.append((path_point(s_hunter(f)), path_point(s_wendigo(f))))
    return out


if __name__ == "__main__":  # self-check: the numbers the plan relies on
    assert abs(path_heading(0.1) - BEARING) < 3, path_heading(0.1)
    sw = [s_wendigo(f) for f in range(1, N + 1)]
    assert all(b >= a - 1e-6 for a, b in zip(sw, sw[1:])), "wendigo runs backwards"
    vmax = max((b - a) * FPS for a, b in zip(sw, sw[1:]))
    assert vmax < 7.0, f"wendigo too fast: {vmax:.1f} m/s"
    assert s_hunter(N) < LENGTH - 2, f"path too short: {s_hunter(N):.1f} of {LENGTH:.1f} m"
    print(f"path {LENGTH:.1f} m, hunter covers {s_hunter(N):.1f} m, trip at s={s_hunter(TRIP):.1f}, "
          f"wendigo max {vmax:.1f} m/s, behind by " +
          ", ".join(f"{d_wendigo((a + b) / 2):.1f} m" for a, b, _ in LOOKBACKS))
