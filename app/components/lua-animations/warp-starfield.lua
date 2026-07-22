-- Warp starfield: stars streaming past the camera in 3D.
local N = 280
local stars = {}
local last = 0

function setup(w, h)
  for i = 1, N do
    stars[i] = {
      x = (math.random() * 2 - 1) * w * 0.5,
      y = (math.random() * 2 - 1) * h * 0.5,
      z = math.random() * w,
    }
  end
end

function draw(t, w, h)
  local dt = t - last
  if dt <= 0 or dt > 0.1 then dt = 0.016 end
  last = t

  fade(5, 6, 12, 0.35)

  local cx, cy = w / 2, h / 2
  local speed = w * 0.6

  for i = 1, N do
    local s = stars[i]
    s.z = s.z - speed * dt
    if s.z <= 1 then
      s.x = (math.random() * 2 - 1) * w * 0.5
      s.y = (math.random() * 2 - 1) * h * 0.5
      s.z = w
    end

    local k = w / s.z
    local sx = cx + s.x * k
    local sy = cy + s.y * k

    if sx >= 0 and sx <= w and sy >= 0 and sy <= h then
      local depth = 1 - s.z / w
      local size = depth * 3.4 + 0.3
      local b = math.floor(150 + depth * 105)
      fill(b, b, 255, 1)
      circle(sx, sy, size)
    end
  end
end
