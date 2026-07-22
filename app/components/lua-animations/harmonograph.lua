-- Harmonograph: a slowly morphing Lissajous curve glowing over its own trails.
function draw(t, w, h)
  fade(4, 4, 8, 0.10)

  local cx, cy = w / 2, h / 2
  -- Independent x/y amplitudes so the figure fills wide, short canvases.
  local Ax, Ay = w * 0.45, h * 0.42
  local a = 3 + math.sin(t * 0.07) * 1.2
  local b = 4 + math.cos(t * 0.05) * 1.2
  local ph = t * 0.4

  line_width(1.6)

  local steps = 260
  local px, py
  for i = 0, steps do
    local u = i / steps * math.pi * 2
    local x = cx + Ax * math.sin(a * u + ph)
    local y = cy + Ay * math.sin(b * u)
    if i > 0 then
      stroke_hsl((i / steps * 300 + t * 30) % 360, 88, 62, 0.9)
      line(px, py, x, y)
    end
    px, py = x, y
  end
end
