"""Text contrast over every frame of a project video, as the home page shows it (object-fit: cover + the two gradients).

Run from the project root:  python -I output/project-visuals/tools/contrast.py [--boxes <json>] <video> [<video> ...]
For each breakpoint and each text element, the worst frame (header text also gets the header's own gradient): the brightest background pixel inside the element's box
(after the gradients) against the element's colour. Text boxes measured on the live home page (NBA stop), 2026-11-16.
"""
import json, subprocess, sys
import numpy as np

def hexrgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
INK, GESSO, STONE2, GOLD = map(hexrgb, ['#1F1D1A', '#EEE9DF', '#CFC8BA', '#C8A24A'])
def rel(c): c = np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4); return c @ np.array([.2126, .7152, .0722], np.float32)

# name, colour, needed ratio (large text >= 24 px: 3, otherwise 4.5), box per breakpoint [x0, y0, x1, y1]
EL = [('card count', GOLD, 4.5), ('card title', GESSO, 3), ('card line', GESSO, 4.5), ('card meta', STONE2, 4.5),
      ('Live demo', GESSO, 4.5), ('Code', GESSO, 4.5), ('scroll hint', STONE2, 4.5),
      ('header name', GESSO, 3), ('header tagline', STONE2, 4.5), ('nav Projects', STONE2, 4.5), ('nav About', STONE2, 4.5),
      ('nav CV', STONE2, 4.5), ('nav Email', STONE2, 4.5)]
BOX = {(1280, 800): [[64, 218, 448, 238], [64, 250, 448, 357], [64, 369, 448, 428], [64, 444, 448, 489], [231, 522, 323, 546], [347, 522, 394, 546], [64, 594, 448, 614],
                     [40, 28, 445, 65], [40, 69, 445, 94], [973, 44, 1040, 62], [1068, 44, 1110, 62], [1138, 44, 1155, 62], [1183, 44, 1225, 62]],
       (1440, 900): [[72, 273, 504, 292], [72, 304, 504, 425], [72, 437, 504, 496], [72, 512, 504, 534], [239, 567, 331, 591], [355, 567, 402, 591], [72, 640, 504, 659],
                     [40, 28, 445, 65], [40, 69, 445, 94], [1133, 44, 1200, 62], [1228, 44, 1270, 62], [1298, 44, 1315, 62], [1343, 44, 1385, 62]],
       (1920, 1080): [[96, 360, 576, 380], [96, 392, 576, 518], [96, 530, 576, 588], [96, 604, 576, 627], [263, 660, 355, 684], [379, 660, 426, 684], [96, 732, 576, 752],
                      [40, 28, 445, 65], [40, 69, 445, 94], [1613, 44, 1680, 62], [1708, 44, 1750, 62], [1778, 44, 1795, 62], [1823, 44, 1865, 62]]}

def frames(path, w, h):
    # object-fit: cover = scale to fill, centre-crop. ffmpeg does the same with scale + crop.
    vf = f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)

# --boxes <json> (from tools/boxes.cjs) replaces the NBA boxes with another card's: {"1280x800": [[x0, y0, x1, y1] x 13], ...}
argv = sys.argv[1:]
if argv[:1] == ['--boxes']:
    BOX = {tuple(map(int, k.split('x'))): v for k, v in json.load(open(argv[1])).items()}; argv = argv[2:]
report = {}
for path in argv:
    report[path] = {}
    for (w, h), boxes in BOX.items():
        # .visuals::after: the top gradient (bottom layer) then the left gradient (top layer), ink at the given alpha;
        # then the fixed header's own gradient (.site: 88% ink at the top to clear at its bottom edge, 142.4 px tall).
        ay = (np.clip(1 - np.arange(h) / 144, 0, 1) * .8)[:, None, None]
        ax = np.interp(np.arange(w) / w, [0, .32, .46, .64, 1], [.94, .94, .55, 0, 0])[None, :, None]
        ah = (np.clip(1 - np.arange(h) / 142.4, 0, 1) * .88)[:, None, None]
        worst = {n: (99.0, -1) for n, _, _ in EL}; fails = {n: 0 for n, _, _ in EL}; count = 0
        for t, f in enumerate(frames(path, w, h)):
            count += 1
            a = f.astype(np.float32) / 255
            a = a * (1 - ay) + INK * ay; a = a * (1 - ax) + INK * ax; a = a * (1 - ah) + INK * ah
            for (n, col, need), box in zip(EL, boxes):
                if box is None: continue                          # not on this page (boxes.cjs)
                x0, y0, x1, y1 = box
                bg = rel(a[y0:y1, x0:x1].reshape(-1, 3)).max()
                c = (rel(col) + .05) / (bg + .05)
                if c < worst[n][0]: worst[n] = (float(c), t)
                fails[n] += c < need
        report[path][f'{w}x{h}'] = {n: {'min': round(worst[n][0], 2), 'frame': worst[n][1], 'needs': need, 'pass': worst[n][0] >= need, 'failing_frames': f'{fails[n]}/{count}'}
                                    for (n, _, need), box in zip(EL, boxes) if box is not None}
print(json.dumps(report, indent=1))
