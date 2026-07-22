-- Flow field: particles drifting along an animated noise field, leaving rainbow trails.
local N = 420
local P = {}

function setup(w, h)
  for i = 1, N do
    P[i] = { x = math.random() * w, y = math.random() * h }
  end
end

function draw(t, w, h)
  fade(8, 8, 14, 0.06)
  line_width(1.4)

  local scale = 0.006
  for i = 1, N do
    local p = P[i]
    local a = math.sin(p.x * scale + t * 0.3) + math.cos(p.y * scale - t * 0.2)
    local ang = a * math.pi
    local nx = p.x + math.cos(ang) * 1.7
    local ny = p.y + math.sin(ang) * 1.7

    local hue = (a * 60 + t * 24) % 360
    stroke_hsl(hue, 90, 62, 0.75)
    line(p.x, p.y, nx, ny)

    p.x, p.y = nx, ny
    if p.x < 0 or p.x > w or p.y < 0 or p.y > h then
      p.x = math.random() * w
      p.y = math.random() * h
    end
  end
end
