"""Pure-Python boids core for the web demo (no Qt, no numpy).

Identical algorithm to 01-murmuration, but headless: it only computes state.
Rendering is done by the canvas layer. Runs unchanged under CPython (for
headless tests) and under Pyodide (in the browser).
"""

import math
import random

MAX_SPEED = 3.4
MAX_FORCE = 0.09
PERCEPTION = 46.0
SEP_RADIUS = 22.0


def _limit(vx, vy, m):
    d = math.hypot(vx, vy)
    if d > m and d > 0:
        s = m / d
        return vx * s, vy * s
    return vx, vy


class Boids:
    def __init__(self, w, h, n=160):
        self.w = float(w)
        self.h = float(h)
        # each boid: [x, y, vx, vy]
        self.b = []
        for _ in range(n):
            a = random.uniform(0, math.tau)
            self.b.append([random.uniform(0, w), random.uniform(0, h),
                           math.cos(a) * MAX_SPEED, math.sin(a) * MAX_SPEED])

    def resize(self, w, h):
        self.w = float(w)
        self.h = float(h)

    def step(self):
        w, h = self.w, self.h
        boids = self.b
        for b in boids:
            bx, by, bvx, bvy = b
            sx = sy = ax = ay = cx = cy = 0.0
            sep_n = ali_n = 0
            for o in boids:
                if o is b:
                    continue
                dx = bx - o[0]
                dy = by - o[1]
                d2 = dx * dx + dy * dy
                if d2 > PERCEPTION * PERCEPTION or d2 == 0:
                    continue
                d = math.sqrt(d2)
                if d < SEP_RADIUS:
                    sx += dx / d
                    sy += dy / d
                    sep_n += 1
                ax += o[2]
                ay += o[3]
                cx += o[0]
                cy += o[1]
                ali_n += 1

            fx = fy = 0.0
            if sep_n:
                fx += sx * 1.5
                fy += sy * 1.5
            if ali_n:
                ax, ay = ax / ali_n, ay / ali_n
                dvx, dvy = _limit(ax - bvx, ay - bvy, MAX_FORCE * 8)
                fx += dvx
                fy += dvy
                cx, cy = cx / ali_n, cy / ali_n
                dcx, dcy = _limit((cx - bx) * 0.01, (cy - by) * 0.01, MAX_FORCE * 8)
                fx += dcx
                fy += dcy

            m = 60.0
            if bx < m:
                fx += (m - bx) * 0.02
            elif bx > w - m:
                fx -= (bx - (w - m)) * 0.02
            if by < m:
                fy += (m - by) * 0.02
            elif by > h - m:
                fy -= (by - (h - m)) * 0.02

            bvx, bvy = _limit(bvx + fx, bvy + fy, MAX_SPEED)
            bx = (bx + bvx) % w
            by = (by + bvy) % h
            b[0], b[1], b[2], b[3] = bx, by, bvx, bvy

    def state(self):
        """Flat [x, y, heading, ...] list for the canvas layer to draw."""
        out = []
        for bx, by, bvx, bvy in self.b:
            out.append(bx)
            out.append(by)
            out.append(math.atan2(bvy, bvx))
        return out
