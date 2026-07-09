"""Pure-Python L-system core (no Qt).

Expands an L-system and turtle-interprets it into a flat segment list plus a
bounding box. The canvas layer handles progressive reveal, sway, and cycling.
Runs identically under CPython and Pyodide.
"""

import math

# name -> (axiom, rules, angle_deg, depth, start_heading_deg)
SYSTEMS = {
    "Fractal plant": ("X", {"X": "F+[[X]-X]-F[-FX]+X", "F": "FF"}, 25, 5, -90),
    "Dragon curve": ("FX", {"X": "X+YF+", "Y": "-FX-Y"}, 90, 11, 0),
    "Koch curve": ("F", {"F": "F+F-F-F+F"}, 90, 4, 0),
    "Sierpinski": ("F-G-G", {"F": "F-G+F+G-F", "G": "GG"}, 120, 6, 0),
    "Koch snowflake": ("F++F++F", {"F": "F-F++F-F"}, 60, 4, 0),
}
ORDER = list(SYSTEMS)
MAX_LEN = 300_000


def expand(axiom, rules, depth):
    s = axiom
    for _ in range(depth):
        s = "".join(rules.get(ch, ch) for ch in s)
        if len(s) > MAX_LEN:
            break
    return s


def turtle(s, angle_deg, start_heading):
    x, y = 0.0, 0.0
    heading = math.radians(start_heading)
    a = math.radians(angle_deg)
    stack = []
    segs = []
    for ch in s:
        if ch in "FG":
            nx = x + math.cos(heading)
            ny = y + math.sin(heading)
            segs.append((x, y, nx, ny))
            x, y = nx, ny
        elif ch == "+":
            heading += a
        elif ch == "-":
            heading -= a
        elif ch == "[":
            stack.append((x, y, heading))
        elif ch == "]":
            if stack:
                x, y, heading = stack.pop()
    return segs


class LSystem:
    def __init__(self, w, h):
        self.idx = 0
        self.segs = []
        self._bbox = (0.0, 0.0, 1.0, 1.0)
        self.load(ORDER[0])

    def resize(self, w, h):
        pass

    def load(self, name):
        self.name = name
        axiom, rules, angle, depth, start = SYSTEMS[name]
        segs = turtle(expand(axiom, rules, depth), angle, start)
        self.segs = segs
        xs = [p for seg in segs for p in (seg[0], seg[2])] or [0.0, 1.0]
        ys = [p for seg in segs for p in (seg[1], seg[3])] or [0.0, 1.0]
        self._bbox = (min(xs), min(ys), max(xs), max(ys))

    def next(self):
        self.idx = (self.idx + 1) % len(ORDER)
        self.load(ORDER[self.idx])

    def current(self):
        return self.name

    def is_plant(self):
        return self.name == "Fractal plant"

    def bbox(self):
        return list(self._bbox)

    def segments(self):
        """Flat [x1, y1, x2, y2, ...] segment coordinates."""
        out = []
        for x1, y1, x2, y2 in self.segs:
            out.append(x1)
            out.append(y1)
            out.append(x2)
            out.append(y2)
        return out
