-- Fireworks: rockets arc up and burst into gravity-bound, fading sparks.
-- Motion is scaled to the canvas height so bursts stay in frame on the wide,
-- short banner this normally renders into.
local rockets = {}
local sparks = {}
local timer = 0

local function launch(w, h)
  rockets[#rockets + 1] = {
    x = w * (0.1 + math.random() * 0.8),
    y = h,
    vx = (math.random() - 0.5) * h * 0.010,
    vy = -(h * 0.022 + math.random() * h * 0.010),
    target = h * (0.12 + math.random() * 0.30),
    hue = math.random() * 360,
  }
end

function draw(t, w, h)
  fade(6, 6, 12, 0.16)

  local g = h * 0.0008

  timer = timer - 1
  if timer <= 0 then
    launch(w, h)
    timer = 14 + math.floor(math.random() * 24)
  end

  for i = #rockets, 1, -1 do
    local r = rockets[i]
    r.x = r.x + r.vx
    r.y = r.y + r.vy
    r.vy = r.vy + g
    fill_hsl(r.hue, 90, 74, 1)
    circle(r.x, r.y, 1.8)

    if r.y <= r.target or r.vy >= 0 then
      local n = 40 + math.floor(math.random() * 30)
      for k = 1, n do
        local ang = math.random() * math.pi * 2
        local sp = (0.3 + math.random()) * h * 0.011
        sparks[#sparks + 1] = {
          x = r.x, y = r.y,
          vx = math.cos(ang) * sp,
          vy = math.sin(ang) * sp,
          life = 1,
          hue = r.hue + (math.random() - 0.5) * 40,
        }
      end
      table.remove(rockets, i)
    end
  end

  for i = #sparks, 1, -1 do
    local s = sparks[i]
    s.x = s.x + s.vx
    s.y = s.y + s.vy
    s.vy = s.vy + g
    s.vx = s.vx * 0.985
    s.vy = s.vy * 0.985
    s.life = s.life - 0.018
    if s.life <= 0 then
      table.remove(sparks, i)
    else
      fill_hsl(s.hue, 90, 64, s.life)
      circle(s.x, s.y, 1.8 * s.life + 0.4)
    end
  end
end
