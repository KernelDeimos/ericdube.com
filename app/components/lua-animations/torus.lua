-- Rotating torus: a point-cloud donut tumbling in 3D with depth shading.
local pts = {}

function setup(w, h)
  local R, r = 1.0, 0.42
  for i = 0, 47 do
    for j = 0, 23 do
      local u = i / 48 * math.pi * 2
      local v = j / 24 * math.pi * 2
      pts[#pts + 1] = {
        x = (R + r * math.cos(v)) * math.cos(u),
        y = (R + r * math.cos(v)) * math.sin(u),
        z = r * math.sin(v),
      }
    end
  end
end

function draw(t, w, h)
  background(6, 7, 12)

  local cx, cy = w / 2, h / 2
  -- Sized to the header's larger dimension, so the donut is big enough to spill
  -- past the top and bottom edges. As it tumbles it sweeps wide and, when it
  -- lands edge-on, fills much of the header's width. Cutting off is intentional.
  local scale = math.max(w, h) * 0.18
  local ax, ay = t * 0.5, t * 0.32
  local cosx, sinx = math.cos(ax), math.sin(ax)
  local cosy, siny = math.cos(ay), math.sin(ay)

  for _, p in ipairs(pts) do
    local y1 = p.y * cosx - p.z * sinx
    local z1 = p.y * sinx + p.z * cosx
    local x2 = p.x * cosy + z1 * siny
    local z2 = -p.x * siny + z1 * cosy

    local persp = 3 / (3 + z2)
    local sx = cx + x2 * scale * persp
    local sy = cy + y1 * scale * persp

    local light = math.max(0, math.min(1, (z2 + 1.4) / 2.8))
    fill_hsl((205 + z2 * 45) % 360, 82, 30 + light * 45, 1)
    circle(sx, sy, (scale * 0.012 + 0.6) * persp + 0.3)
  end
end
