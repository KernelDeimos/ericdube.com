"""Pure-Python Game of Life core with a pattern library (no Qt).

Bounded grid so the Gosper gun behaves. Tracks cell age for colouring. The canvas
layer draws the returned live cells. Runs identically under CPython and Pyodide.
"""

import random

GLIDER = [(1, 0), (2, 1), (0, 2), (1, 2), (2, 2)]
LWSS = [(0, 0), (3, 0), (4, 1), (0, 2), (4, 2), (1, 3), (2, 3), (3, 3), (4, 3)]
ACORN = [(1, 0), (3, 1), (0, 2), (1, 2), (4, 2), (5, 2), (6, 2)]
GOSPER = [
    (0, 4), (0, 5), (1, 4), (1, 5),
    (10, 4), (10, 5), (10, 6), (11, 3), (11, 7), (12, 2), (12, 8), (13, 2), (13, 8),
    (14, 5), (15, 3), (15, 7), (16, 4), (16, 5), (16, 6), (17, 5),
    (20, 2), (20, 3), (20, 4), (21, 2), (21, 3), (21, 4), (22, 1), (22, 5),
    (24, 0), (24, 1), (24, 5), (24, 6), (34, 2), (34, 3), (35, 2), (35, 3),
]
PATTERNS = ["Random soup", "Gosper glider gun", "Acorn", "Glider fleet", "LWSS"]


class Life:
    def __init__(self, w, h, cell=8):
        self.cell = int(cell)
        self.W = max(20, int(w) // self.cell)
        self.H = max(16, int(h) // self.cell)
        self.grid = bytearray(self.W * self.H)
        self.age = bytearray(self.W * self.H)
        self.gen = 0
        self.pattern = PATTERNS[0]
        self._auto = True
        self.load(self.pattern)

    def resize(self, w, h):
        newW = max(20, int(w) // self.cell)
        newH = max(16, int(h) // self.cell)
        if (newW, newH) != (self.W, self.H):
            self.W, self.H = newW, newH
            self.load(self.pattern)

    def load(self, name):
        self.pattern = name
        self.grid = bytearray(self.W * self.H)
        self.age = bytearray(self.W * self.H)
        self.gen = 0

        def place(cells, ox, oy):
            for (x, y) in cells:
                gx, gy = ox + x, oy + y
                if 0 <= gx < self.W and 0 <= gy < self.H:
                    self.grid[gy * self.W + gx] = 1

        if name == "Random soup":
            for i in range(self.W * self.H):
                self.grid[i] = 1 if random.random() < 0.28 else 0
        elif name == "Gosper glider gun":
            place(GOSPER, 2, 2)
        elif name == "Acorn":
            place(ACORN, self.W // 2 - 3, self.H // 2)
        elif name == "Glider fleet":
            for k in range(6):
                place(GLIDER, 3 + k * 6, 3 + (k % 3) * 6)
        elif name == "LWSS":
            for k in range(3):
                place(LWSS, 3, 5 + k * 8)

    def set_auto(self, on):
        self._auto = bool(on)

    def step(self):
        W, H, g = self.W, self.H, self.grid
        new = bytearray(W * H)
        age = self.age
        pop = 0
        for y in range(H):
            row = y * W
            ym, yp = (y - 1) * W, (y + 1) * W
            for x in range(W):
                i = row + x
                n = 0
                xm, xp = x - 1, x + 1
                if y > 0:
                    if xm >= 0: n += g[ym + xm]
                    n += g[ym + x]
                    if xp < W: n += g[ym + xp]
                if xm >= 0: n += g[row + xm]
                if xp < W: n += g[row + xp]
                if y < H - 1:
                    if xm >= 0: n += g[yp + xm]
                    n += g[yp + x]
                    if xp < W: n += g[yp + xp]
                alive = g[i]
                if (alive and (n == 2 or n == 3)) or (not alive and n == 3):
                    new[i] = 1
                    age[i] = min(255, age[i] + 1) if alive else 1
                    pop += 1
                else:
                    age[i] = 0
        self.grid = new
        self.gen += 1
        if self._auto and (pop == 0 or self.gen > 900):
            idx = (PATTERNS.index(self.pattern) + 1) % len(PATTERNS)
            self.load(PATTERNS[idx])

    def dims(self):
        return [self.W, self.H, self.cell]

    def cells(self):
        """Flat [col, row, age, ...] of live cells."""
        out = []
        W, g, age = self.W, self.grid, self.age
        for i in range(len(g)):
            if g[i]:
                out.append(i % W)
                out.append(i // W)
                out.append(age[i])
        return out
