/*
 * PyDemo — tiny harness for "Python simulates, canvas paints" demos.
 *
 * Loads Pyodide, runs a pure-Python core (fetched from ./cores/NAME.py), then
 * drives a requestAnimationFrame loop: each frame calls your step()/draw().
 * The Python core holds all simulation state; JS only paints what it returns.
 *
 * Page must contain: <canvas id="c">, <div id="boot"> (loading overlay).
 */
window.PyDemo = (function () {
  // Convert a Python list PyProxy -> JS array and free the proxy (no leaks).
  function arr(proxy) {
    const a = proxy.toJs();
    proxy.destroy();
    return a;
  }

  async function loadCore(url) {
    const pyodide = await loadPyodide();
    const code = await (await fetch(url)).text();
    pyodide.runPython(code);
    return pyodide;
  }

  async function canvas(opts) {
    const cv = document.getElementById('c');
    const boot = document.getElementById('boot');
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      const r = cv.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    };
    const fit = (sim) => {
      const { w, h } = size();
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      if (sim && opts.onResize) opts.onResize(sim, w, h);
    };
    try {
      const pyodide = await loadCore(opts.coreUrl);
      const { w, h } = size();
      const sim = opts.create(pyodide, w, h);
      new ResizeObserver(() => fit(sim)).observe(cv);
      fit(sim);
      if (boot) boot.classList.add('hidden');
      if (opts.onReady) opts.onReady(sim, pyodide);
      const interval = 1000 / (opts.fps || 30);
      let last = 0;
      const loop = (t) => {
        requestAnimationFrame(loop);
        if (t - last < interval) return;
        last = t;
        opts.step(sim);
        const s = size();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        opts.draw(ctx, sim, s.w, s.h);
      };
      requestAnimationFrame(loop);
    } catch (e) {
      if (boot) boot.innerHTML = 'Failed to start Python.<br><small>' + String(e) + '</small>';
      console.error(e);
    }
  }

  return { canvas, loadCore, arr };
})();
