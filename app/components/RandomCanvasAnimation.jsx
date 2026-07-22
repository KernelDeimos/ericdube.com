import { useEffect, useRef } from 'react';

import { LUA_ANIMATIONS } from './lua-animations';

// Wires a canvas 2D context into a Fengari Lua state as a set of global drawing
// functions, then loads and runs one of the Lua animation scripts. Each script
// defines an optional `setup(w, h)` and a `draw(t, w, h)` called once per frame.
function bootstrap(fengari, canvas, ctx, source) {
  const { lua, lauxlib, lualib, to_luastring } = fengari;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  const num = (i, fallback) =>
    lua.lua_gettop(L) >= i && !lua.lua_isnoneornil(L, i)
      ? lua.lua_tonumber(L, i)
      : fallback;

  const reg = (name, fn) => {
    lua.lua_pushcfunction(L, fn);
    lua.lua_setglobal(L, to_luastring(name));
  };

  reg('background', () => {
    ctx.fillStyle = `rgb(${num(1, 0)}, ${num(2, 0)}, ${num(3, 0)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return 0;
  });
  reg('fade', () => {
    ctx.fillStyle = `rgba(${num(1, 0)}, ${num(2, 0)}, ${num(3, 0)}, ${num(4, 1)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return 0;
  });
  reg('fill', () => {
    ctx.fillStyle = `rgba(${num(1, 0)}, ${num(2, 0)}, ${num(3, 0)}, ${num(4, 1)})`;
    return 0;
  });
  reg('fill_hsl', () => {
    ctx.fillStyle = `hsla(${num(1, 0)}, ${num(2, 0)}%, ${num(3, 0)}%, ${num(4, 1)})`;
    return 0;
  });
  reg('stroke', () => {
    ctx.strokeStyle = `rgba(${num(1, 0)}, ${num(2, 0)}, ${num(3, 0)}, ${num(4, 1)})`;
    return 0;
  });
  reg('stroke_hsl', () => {
    ctx.strokeStyle = `hsla(${num(1, 0)}, ${num(2, 0)}%, ${num(3, 0)}%, ${num(4, 1)})`;
    return 0;
  });
  reg('line_width', () => {
    ctx.lineWidth = num(1, 1);
    return 0;
  });
  reg('circle', () => {
    ctx.beginPath();
    ctx.arc(num(1, 0), num(2, 0), Math.max(0, num(3, 0)), 0, 2 * Math.PI);
    ctx.fill();
    return 0;
  });
  reg('ring', () => {
    ctx.beginPath();
    ctx.arc(num(1, 0), num(2, 0), Math.max(0, num(3, 0)), 0, 2 * Math.PI);
    ctx.stroke();
    return 0;
  });
  reg('line', () => {
    ctx.beginPath();
    ctx.moveTo(num(1, 0), num(2, 0));
    ctx.lineTo(num(3, 0), num(4, 0));
    ctx.stroke();
    return 0;
  });
  reg('rect', () => {
    ctx.fillRect(num(1, 0), num(2, 0), num(3, 0), num(4, 0));
    return 0;
  });

  if (lauxlib.luaL_dostring(L, to_luastring(source)) !== lua.LUA_OK) {
    throw new Error(`Lua load error: ${lua.lua_tojsstring(L, -1)}`);
  }

  const callGlobal = (name, args) => {
    lua.lua_getglobal(L, to_luastring(name));
    if (!lua.lua_isfunction(L, -1)) {
      lua.lua_pop(L, 1);
      return true; // absent optional hook is fine
    }
    for (const a of args) lua.lua_pushnumber(L, a);
    if (lua.lua_pcall(L, args.length, 0, 0) !== lua.LUA_OK) {
      console.error(`Lua ${name}() error:`, lua.lua_tojsstring(L, -1));
      lua.lua_pop(L, 1);
      return false;
    }
    return true;
  };

  return callGlobal;
}

/**
 * Runs a Lua-driven canvas animation. Pass `script` to run a specific one
 * (the animation restarts whenever it changes); otherwise one is picked at
 * random from `scripts`, defaulting to the full set.
 *
 * @param {{ className?: any, style?: any, script?: any, scripts?: any }} props
 */
export default function RandomCanvasAnimation({ className, style, script, scripts }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let cancelled = false;

    // Size the backing store to the element's laid-out size. Done eagerly as
    // well as on resize, so the first frames don't render into the default
    // 300x150 buffer and appear stretched.
    const resize = (w, h) => {
      const nw = Math.max(1, Math.round(w));
      const nh = Math.max(1, Math.round(h));
      if (canvas.width !== nw) canvas.width = nw;
      if (canvas.height !== nh) canvas.height = nh;
    };
    resize(canvas.clientWidth, canvas.clientHeight);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (!entry.contentRect) continue;
        resize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(canvas);

    const pool = scripts && scripts.length > 0 ? scripts : LUA_ANIMATIONS;
    const chosen = script ?? pool[Math.floor(Math.random() * pool.length)];

    // `fengari-web` is the browser distribution of Fengari; the plain `fengari`
    // package is authored for Node and pulls in `os`/`fs`/`tmp` at load time.
    // Imported lazily so the Lua VM stays out of the SSR and initial bundles.
    import('fengari-web').then(mod => {
      const fengari = mod.default ?? mod;
      if (cancelled) return;
      console.log('RandomCanvasAnimation script:', chosen.name);

      let callGlobal;
      try {
        callGlobal = bootstrap(fengari, canvas, ctx, chosen.source);
      } catch (err) {
        console.error('RandomCanvasAnimation failed to load Lua script:', err);
        return;
      }

      callGlobal('setup', [canvas.width, canvas.height]);

      const start = performance.now();
      const frame = () => {
        const t = (performance.now() - start) / 1000;
        const ok = callGlobal('draw', [t, canvas.width, canvas.height]);
        if (ok && !cancelled) animId = requestAnimationFrame(frame);
      };
      frame();
    }).catch(err => {
      console.error('RandomCanvasAnimation failed to load the Lua VM:', err);
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [script]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
