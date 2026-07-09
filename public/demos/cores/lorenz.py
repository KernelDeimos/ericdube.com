"""Pure-Python Lorenz attractor core (no Qt, no numpy).

Integrates the Lorenz system and keeps a rolling trail. The canvas layer does the
rotation/projection/coloring. Runs identically under CPython and Pyodide.
"""

SIGMA, RHO, BETA = 10.0, 28.0, 8.0 / 3.0
DT = 0.006


class Lorenz:
    def __init__(self, w, h, trail=2200, steps=5):
        self.x, self.y, self.z = 0.1, 0.0, 0.0
        self.trail = []
        self.max = int(trail)
        self.steps = int(steps)

    def resize(self, w, h):
        pass

    def step(self):
        for _ in range(self.steps):
            dx = SIGMA * (self.y - self.x)
            dy = self.x * (RHO - self.z) - self.y
            dz = self.x * self.y - BETA * self.z
            self.x += dx * DT
            self.y += dy * DT
            self.z += dz * DT
            self.trail.append((self.x, self.y, self.z))
        if len(self.trail) > self.max:
            del self.trail[: len(self.trail) - self.max]

    def state(self):
        """Flat [x, y, z, ...] of the current trail (unprojected)."""
        out = []
        for x, y, z in self.trail:
            out.append(x)
            out.append(y)
            out.append(z)
        return out
