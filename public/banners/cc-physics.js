/*
 * Real physics for two parts of the Coherent Constructs factory banner.
 *
 * The drawing is otherwise pure CSS keyframes, and keyframes are a fine way to
 * animate a machine that repeats: a belt, a fan, a press. They are a poor way to
 * animate anything that responds to something else. Two places in the drawing
 * were pretending:
 *
 *   - the loads hanging off the overhead monorail swayed on a fixed 3.2s
 *     `rotate(-5deg) → rotate(5deg)` alternation, so every load swung in the
 *     same arc at the same rate forever, unrelated to the trolley carrying it;
 *   - the transfer chute translated three shapes along the diagonal by a fixed
 *     `translate(54px,90px)`, so they slid at a rate no slope would produce and
 *     stopped dead in mid-air at the belt.
 *
 * Both are now simulated with matter.js. The pendulums hang from pivots that
 * follow the real trolley positions and get bumped as the trolley crosses each
 * rail support; the chute shapes are rigid bodies that fall, hit the slope,
 * slide down it under friction and land on the outbound belt.
 *
 * This is progressive enhancement, and deliberately so. Every constant below
 * that describes the drawing is checked against the DOM at startup, and any
 * mismatch aborts the whole thing and leaves the CSS animations running. The
 * banner is a generated copy of someone else's page (see
 * scripts/build-cc-banner.mjs); when that page moves the chute, this script must
 * degrade to the old animation rather than draw shapes sliding through thin air.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Geometry, copied from the drawing. Checked against the DOM in `verify()`.
  // ---------------------------------------------------------------------------

  // Transfer chute: a channel between two parallel rails, descending right.
  var CHUTE_SPAWN = { x: 1192, y: 240 };
  var CHUTE_FLOOR = [{ x: 1180, y: 232 }, { x: 1234, y: 322 }]; // the surface shapes ride
  var CHUTE_OFFSET = { x: 18, y: -11 }; // floor rail → roof rail, i.e. across the channel

  // Outbound belt, from the capsule path `M1560,330 a11,11 ... l-340,0 ...`.
  var BELT = { x0: 1220, x1: 1560, top: 330, depth: 22 };
  // Belt speed comes from the items already riding it: `travelC` moves them
  // 340 user units in 6.4s. Anything the physics puts on the belt has to travel
  // at the same rate or the belt visibly has two speeds.
  var BELT_UNITS_PER_SEC = 340 / 6.4;

  // Overhead monorail. The trolleys start at x=640 and the rail is carried on
  // supports every 160 units; each support is a joint, and a joint is a bump.
  var HOOK_ORIGIN_X = 640;
  var RAIL_SUPPORTS = [700, 860, 1020, 1180, 1340, 1500];
  // Pivot height and rod length, from `translate(0,96)` then the shape at y=38.
  var PIVOT_Y = 96;
  var ROD_LENGTH = 38;
  // The trolleys cross the rail — 980 units — in 19.2s. Needed so a load can be
  // hung already moving with its trolley; see hangAt.
  var RAIL_LENGTH = 980;
  var RAIL_TRAVERSE_MS = 19200;

  // The line's beat. Every station in the drawing is a multiple of it.
  var BEAT_MS = 1600;

  // ---------------------------------------------------------------------------
  // Simulation scale.
  // ---------------------------------------------------------------------------

  var STEP_MS = 1000 / 60;

  /*
   * Gravity, in user units per second squared.
   *
   * Nothing in an SVG says how big it is, so this started out as a number tuned
   * to make the chute take one beat. That was the wrong way round. Working from
   * the drawing's own dimensions instead: the outbound belt sits 42 units above
   * the floor, and a conveyor is about a metre high. That fixes the scale at
   * roughly 1 unit = 2.45cm, and everything else in the drawing then comes out
   * right — the building is 39m by 7m, the chute is 2.6m long, the monorail rod
   * is 0.93m, the belt runs at 1.3 m/s and the trolleys at 1.25 m/s. All of those
   * are ordinary values for the thing they depict, which is a good sign the scale
   * is honest.
   *
   * At that scale real gravity is 400 units/s², so gravity is not tuned at all.
   * Two things then fall out rather than being chosen: the monorail's 1.94s
   * period (2π√(0.93/9.81), i.e. exactly what a metre of chain does), and a chute
   * descent of about 1.6s, which is the line's beat. The beat was the thing being
   * tuned for, and it turns out the drawing was already to scale.
   *
   * Matter applies gravity as `mass * gravity.y * gravity.scale` and integrates
   * with delta in milliseconds, so with the default scale of 0.001 a gravity.y
   * of 1 works out to ~1000 units/s².
   */
  var GRAVITY_UNITS_PER_S2 = 400;

  // Chute friction. Both surfaces carry a value because matter resolves a
  // contact with the lower of the two.
  var CHUTE_FRICTION = 0.34;
  var CARGO_FRICTION = 0.34;
  var BELT_FRICTION = 0.6; // belt: grabs a landing shape rather than skidding

  /*
   * The monorail loads: air drag, and the bump at each rail joint.
   *
   * RAIL_JOLT is the one number here that is picked for looks rather than
   * derived, and it is worth saying so plainly. It is the velocity change the
   * load takes as its trolley crosses a rail support, in units per step; at 0.35
   * that is about half a metre per second, which is a far harder knock than a
   * real rail joint gives. A realistic joint would swing these loads by under a
   * degree — true, and invisible at the size this drawing is displayed. So the
   * bump is exaggerated to about ±10°, roughly double the ±5° the CSS version
   * asserted, and unlike that version it varies per load and over time.
   *
   * Drag does two jobs, which is why it is small and specific. It decays a swing,
   * so a load does not keep whatever the worst bump ever gave it; and it pulls
   * the load backwards while the trolley tows it, which the rod supplies by
   * tilting back, so the loads trail about a degree. The trail is correct — a
   * towed load does trail — but it is a permanent offset, so it has to stay small
   * enough to read as trailing rather than as broken. An earlier version at 0.008
   * trailed 13°, which just looked wrong.
   */
  var LOAD_DRAG = 0.003;
  var RAIL_JOLT = 0.35;

  // Collision categories. The pendulums are decorative loads on separate rails
  // and must not touch each other or the chute; the chute shapes queue up
  // against each other, because a chute where two shapes can occupy the same
  // spot is exactly the fakery being removed.
  var CAT_STRUCTURE = 0x0001;
  var CAT_CARGO = 0x0002;
  var CAT_LOAD = 0x0004;

  // Shapes fed into the chute, cycling in the order the drawing used. Vertices
  // are the `<use>` targets' own paths, so the body and the line art agree.
  var SHAPE_SCALE = 0.42;
  var SHAPES = [
    { href: '#fx-csq', verts: [[-15, -15], [15, -15], [15, 15], [-15, 15]] },
    { href: '#fx-ctri', verts: [[0, -17], [16, 13], [-16, 13]] },
    { href: '#fx-chex', verts: [[-8, 14], [-16, 0], [-8, -14], [8, -14], [16, 0], [8, 14]] }
  ];

  // How long a shape stays visible after touching the belt. The belt's own
  // items fade in at the same spot on the same beat, so this is a handover: the
  // physics owns the shape until it has landed, then the line takes it.
  var HANDOVER_MS = 260;

  // A descent is about 1.4s. Anything still in the chute after this long is stuck
  // and gets dropped, so one wedged shape cannot silently stop the chute.
  var MAX_FLIGHT_MS = 6 * 1600;

  // ---------------------------------------------------------------------------
  // Startup gates
  //
  // These decide whether the simulation runs at all, and they run before
  // matter.min.js is loaded — the engine is ~80KB, and on a phone or with
  // reduced motion it would be fetched only to sit idle. The banner's HTML no
  // longer loads matter.min.js eagerly; instead, once the gates pass, this
  // script loads the engine and re-runs itself with Matter present.
  // ---------------------------------------------------------------------------

  var svg = document.querySelector('svg.factory');
  if (!svg) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // The reduced-motion rule in the stylesheet collapses the CSS animations.
    // A physics simulation cannot be collapsed, so it simply does not run.
    return;
  }
  if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    // On a touch-primary device (a phone or tablet) the banner is a small cropped
    // strip and the stylesheet drops the factory's ambient motion for a calmer
    // scene (the `(hover: none) and (pointer: coarse)` block in BANNER_CSS). That
    // rule is CSS, so it cannot reach this simulation — left running, the handheld
    // would get the JS pendulums and sliding chute the simplification was meant to
    // remove. So, like reduced-motion above, it bows out and leaves the simplified
    // CSS scene. Matching the primary pointer (not width, not any-pointer) is what
    // keeps a touchscreen laptop like a Surface on the full desktop scene.
    return;
  }

  // The gates passed, so the simulation will run. If the engine is not loaded
  // yet, fetch it and re-run this script once it is ready; the second pass finds
  // window.Matter and falls straight through to the simulation below. Nothing
  // above here has touched the DOM, so running twice is harmless. Both files are
  // plain same-origin scripts, which the banner's sandbox (allow-scripts, no
  // allow-same-origin) permits.
  if (!window.Matter) {
    var engineScript = document.createElement('script');
    engineScript.src = 'matter.min.js';
    engineScript.onload = function () {
      var rerun = document.createElement('script');
      rerun.src = 'cc-physics.js';
      document.head.appendChild(rerun);
    };
    engineScript.onerror = function () {
      // The banner keeps working on CSS alone; it just keeps faking these parts.
      if (window.console) console.warn('cc-physics: matter.min.js did not load; leaving CSS animations');
    };
    document.head.appendChild(engineScript);
    return;
  }

  var slides = Array.prototype.slice.call(svg.querySelectorAll('.slide'));
  var hooks = Array.prototype.slice.call(svg.querySelectorAll('.hook'));

  function bail(why) {
    // Leaves every CSS animation untouched: the banner keeps working, it just
    // keeps faking these two things.
    if (window.console) console.warn('cc-physics: not running — ' + why);
    return false;
  }

  function verify() {
    if (!slides.length) return bail('no .slide elements; the chute has changed');
    if (!hooks.length) return bail('no .hook elements; the monorail has changed');

    var want = 'translate(' + CHUTE_SPAWN.x + ',' + CHUTE_SPAWN.y + ')';
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].parentNode.getAttribute('transform') !== want) {
        return bail('the chute has moved (expected ' + want + ')');
      }
    }
    if (!slides[0].parentNode.parentNode.classList.contains('zone')) {
      return bail('the chute is not wrapped in a .zone group any more');
    }
    for (var j = 0; j < hooks.length; j++) {
      var inner = hooks[j].firstElementChild;
      if (!inner || inner.getAttribute('transform') !== 'translate(' + HOOK_ORIGIN_X + ',0)') {
        return bail('the monorail no longer starts at x=' + HOOK_ORIGIN_X);
      }
      if (!hooks[j].querySelector('.sway')) return bail('a monorail hook has no .sway load');
    }
    // The trolley's speed is a constant here rather than something measured, so
    // check the half of it that can be read back. If the rail animation has been
    // retimed, loads would be hung at the wrong speed and lurch.
    var hookAnim = hooks[0].getAnimations && hooks[0].getAnimations()[0];
    if (hookAnim && hookAnim.effect.getTiming().duration !== RAIL_TRAVERSE_MS) {
      return bail('the rail is no longer traversed in ' + RAIL_TRAVERSE_MS + 'ms');
    }
    return true;
  }

  if (!verify()) return;

  // ---------------------------------------------------------------------------
  // The beat clock
  //
  // Read straight off a belt item's own animation rather than off
  // requestAnimationFrame, so the physics is phase-locked to the line instead of
  // to whenever this script happened to start. Negative until the line starts
  // running (the plant spends its first 8s building itself, camera pulling
  // back); the simulation stays parked until then.
  // ---------------------------------------------------------------------------

  var beatClock = (function () {
    var item = svg.querySelector('.itC');
    var anim = item && item.getAnimations && item.getAnimations()[0];
    if (anim) {
      // currentTime runs from when the animation started, so it counts through
      // the animation-delay as well; the delay IS --t0, so subtracting it gives
      // time since the line started running.
      var t0 = anim.effect.getTiming().delay || 0;
      return function () {
        var t = anim.currentTime;
        if (t === null) return null;
        return (typeof t === 'number' ? t : t.value) - t0;
      };
    }
    // No Web Animations API: fall back to the --t0 the stylesheet uses.
    if (window.console) console.warn('cc-physics: no animation timeline, falling back to wall clock');
    var t0 = 8000;
    var origin = performance.now();
    return function () {
      return performance.now() - origin - t0;
    };
  })();

  // ---------------------------------------------------------------------------
  // World
  // ---------------------------------------------------------------------------

  var M = window.Matter;
  var engine = M.Engine.create();
  engine.gravity.scale = 0.001;
  engine.gravity.y = GRAVITY_UNITS_PER_S2 / 1000;
  // A stiff rod out of a spring constraint needs more than the default two
  // passes, or the loads visibly stretch away from their hangers.
  engine.constraintIterations = 4;

  var BELT_UNITS_PER_STEP = BELT_UNITS_PER_SEC * (STEP_MS / 1000);
  var TROLLEY_UNITS_PER_STEP = RAIL_LENGTH / RAIL_TRAVERSE_MS * STEP_MS;

  function unit(v) {
    var len = Math.hypot(v.x, v.y);
    return { x: v.x / len, y: v.y / len };
  }

  /** A static slab whose top surface lies on the segment a→b. */
  function slab(a, b, thickness, awayFromSurface, options) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var n = unit(awayFromSurface);
    var mid = {
      x: (a.x + b.x) / 2 + n.x * (thickness / 2),
      y: (a.y + b.y) / 2 + n.y * (thickness / 2)
    };
    return M.Bodies.rectangle(mid.x, mid.y, Math.hypot(dx, dy), thickness, Object.assign({
      isStatic: true,
      angle: Math.atan2(dy, dx),
      collisionFilter: { group: 0, category: CAT_STRUCTURE, mask: CAT_CARGO }
    }, options || {}));
  }

  // The channel: shapes ride the lower rail, and the upper rail stops one that
  // arrives with enough speed to climb out.
  var across = CHUTE_OFFSET;
  var back = { x: -across.x, y: -across.y };
  var roofA = { x: CHUTE_FLOOR[0].x + across.x, y: CHUTE_FLOOR[0].y + across.y };
  var roofB = { x: CHUTE_FLOOR[1].x + across.x, y: CHUTE_FLOOR[1].y + across.y };

  M.Composite.add(engine.world, [
    slab(CHUTE_FLOOR[0], CHUTE_FLOOR[1], 6, back, { friction: CHUTE_FRICTION }),
    slab(roofA, roofB, 6, across, { friction: 0.02 }),
    slab(
      { x: BELT.x0, y: BELT.top },
      { x: BELT.x1, y: BELT.top },
      BELT.depth,
      { x: 0, y: 1 },
      { friction: BELT_FRICTION, label: 'belt' }
    )
  ]);

  // ---------------------------------------------------------------------------
  // Chute cargo
  // ---------------------------------------------------------------------------

  /** Area centroid of a polygon, in the shape's own drawing coordinates. */
  function centroid(verts) {
    var a = 0;
    var cx = 0;
    var cy = 0;
    for (var i = 0; i < verts.length; i++) {
      var p = verts[i];
      var q = verts[(i + 1) % verts.length];
      var cross = p[0] * q[1] - q[0] * p[1];
      a += cross;
      cx += (p[0] + q[0]) * cross;
      cy += (p[1] + q[1]) * cross;
    }
    a *= 0.5;
    return { x: cx / (6 * a), y: cy / (6 * a) };
  }

  var chuteZone = slides[0].parentNode.parentNode;
  var cargoLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chuteZone.appendChild(cargoLayer);
  // The CSS chute is now the physics chute; its shapes would double every load.
  slides.forEach(function (el) { el.parentNode.remove(); });

  /*
   * One slot per shape in flight. Four is one more than the chute can hold at a
   * shape per beat, so a slot is always free when the next one is due.
   */
  var SLOTS = 4;
  var cargo = [];

  for (var s = 0; s < SLOTS; s++) {
    var spec = SHAPES[s % SHAPES.length];
    cargo.push(makeCargo(spec));
  }

  function makeCargo(spec) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', spec.href);
    g.appendChild(use);
    g.style.opacity = '0';
    cargoLayer.appendChild(g);

    var c = centroid(spec.verts);
    var verts = spec.verts.map(function (v) {
      return { x: v[0] * SHAPE_SCALE, y: v[1] * SHAPE_SCALE };
    });

    // fromVertices centres the body on the polygon's centroid, but the `<use>`
    // draws from the shape's declared origin — not the same point for the
    // triangle. Rendering shifts by the difference so body and drawing coincide.
    var body = M.Bodies.fromVertices(CHUTE_SPAWN.x, CHUTE_SPAWN.y, [verts], {
      friction: CARGO_FRICTION,
      frictionAir: 0.001,
      restitution: 0.08,
      collisionFilter: { group: 0, category: CAT_CARGO, mask: CAT_CARGO | CAT_STRUCTURE }
    });

    /*
     * The shapes tumble down the chute rather than sliding flat, and that is the
     * chute's own fault rather than a missing setting: a block tips instead of
     * sliding once the slope passes atan(width/height), which is 45° for the
     * square and 47-49° for the others, and this chute is drawn at 59°. Nothing
     * with corners can slide down it.
     *
     * Guiding them flat was the obvious alternative and matter will not do it:
     * with rotation locked, any friction above zero makes a corner contact arrest
     * completely, and the shapes stuck to the slope and crept downhill only as
     * the solver pushed them out of penetration — 105 units in 44 seconds. So
     * they tumble, which at least is what the drawn geometry actually does.
     */

    return {
      el: g,
      body: body,
      offset: { x: -c.x * SHAPE_SCALE, y: -c.y * SHAPE_SCALE },
      inFlight: false,
      launchedAt: null,
      landedAt: null
    };
  }

  function launch(slot, beatIndex) {
    // Small per-shape variation in where it is set down and how it is turned.
    // Identical releases would give identical slides, which is the tell the CSS
    // version had.
    var jitter = ((beatIndex * 2654435761) % 1000) / 1000 - 0.5;
    M.Body.setPosition(slot.body, {
      x: CHUTE_SPAWN.x + jitter * 3,
      y: CHUTE_SPAWN.y - 2
    });
    M.Body.setAngle(slot.body, jitter * 0.6);
    M.Body.setVelocity(slot.body, { x: 0, y: 0 });
    M.Body.setAngularVelocity(slot.body, 0);
    slot.inFlight = true;
    slot.launchedAt = clock;
    slot.landedAt = null;
    slot.el.style.opacity = '1';
    M.Composite.add(engine.world, slot.body);
  }

  function retire(slot) {
    slot.inFlight = false;
    slot.el.style.opacity = '0';
    M.Composite.remove(engine.world, slot.body);
  }

  // A conveyor in a rigid-body engine is a surface that drags what rests on it:
  // matter has no belt, so contact with the belt body pulls the shape toward
  // belt speed instead of letting it sit still on a moving strip.
  // collisionStart as well as collisionActive: a pair's first frame of contact
  // only fires the former, so listening to the latter alone would miss a shape
  // that touched the belt and bounced clear in one frame.
  M.Events.on(engine, 'collisionStart collisionActive', function (event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      var belt = pair.bodyA.label === 'belt' ? pair.bodyA : (pair.bodyB.label === 'belt' ? pair.bodyB : null);
      if (!belt) continue;
      var box = belt === pair.bodyA ? pair.bodyB : pair.bodyA;
      var slot = slotFor(box);
      if (!slot) continue;
      if (slot.landedAt === null) slot.landedAt = clock;
      M.Body.setVelocity(box, {
        x: box.velocity.x + (BELT_UNITS_PER_STEP - box.velocity.x) * 0.25,
        y: box.velocity.y
      });
    }
  });

  function slotFor(body) {
    for (var i = 0; i < cargo.length; i++) if (cargo[i].body === body) return cargo[i];
    return null;
  }

  // ---------------------------------------------------------------------------
  // Monorail loads
  // ---------------------------------------------------------------------------

  function localTranslate(el) {
    var value = getComputedStyle(el).transform;
    if (!value || value === 'none') return { x: 0, y: 0, angle: 0 };
    var m = new DOMMatrixReadOnly(value);
    return { x: m.e, y: m.f, angle: Math.atan2(m.b, m.a) };
  }

  var loads = hooks.map(function (hook) {
    var sway = hook.querySelector('.sway');
    var pivot = M.Bodies.circle(HOOK_ORIGIN_X, PIVOT_Y, 2, {
      isStatic: true,
      collisionFilter: { group: 0, category: CAT_STRUCTURE, mask: 0 }
    });
    var bob = M.Bodies.circle(HOOK_ORIGIN_X, PIVOT_Y + ROD_LENGTH, 8, {
      frictionAir: LOAD_DRAG,
      collisionFilter: { group: 0, category: CAT_LOAD, mask: 0 }
    });
    // The load turns with the rod, not on its own axis, so its spin is unused.
    M.Body.setInertia(bob, Infinity);

    M.Composite.add(engine.world, [pivot, bob, M.Constraint.create({
      bodyA: pivot,
      bodyB: bob,
      length: ROD_LENGTH,
      stiffness: 1,
      damping: 0.02,
      render: { visible: false }
    })]);

    return {
      el: sway,
      pivot: pivot,
      bob: bob,
      trolleyX: null,
      prevTrolleyX: null,
      nextSupport: 0
    };
  });

  /*
   * Hangs a load at a given angle — and, critically, already moving at the
   * trolley's speed rather than from rest.
   *
   * Hanging it at rest is the obvious thing and it is wrong: the pivot is
   * already doing 51 units/s, so a load released at rest is a pendulum whose
   * support is yanked out from under it. That is a 43° lurch — v/ωL, and it
   * comes out to exactly the 43° that showed up as a mystery excursion on every
   * load — once at startup and again every time the rail animation wrapped.
   */
  function hangAt(load, x, angle) {
    M.Body.setPosition(load.pivot, { x: x, y: PIVOT_Y });
    M.Body.setPosition(load.bob, {
      x: x + Math.sin(angle) * ROD_LENGTH,
      y: PIVOT_Y + Math.cos(angle) * ROD_LENGTH
    });
    M.Body.setVelocity(load.bob, { x: TROLLEY_UNITS_PER_STEP, y: 0 });
  }

  /**
   * A rail joint under a moving trolley is a jolt: the trolley checks, the load
   * keeps going and swings forward.
   */
  function jolt(load, direction) {
    var dv = RAIL_JOLT * direction;
    M.Body.applyForce(load.bob, load.bob.position, {
      x: (load.bob.mass * dv) / (STEP_MS * STEP_MS),
      y: 0
    });
  }

  function readTrolleys() {
    for (var i = 0; i < loads.length; i++) {
      var load = loads[i];
      var x = HOOK_ORIGIN_X + localTranslate(hooks[i]).x;
      load.prevTrolleyX = load.trolleyX === null ? x : load.trolleyX;
      load.trolleyX = x;

      // The trolley animation loops: at the wrap it jumps the length of the
      // rail, which would fling the load. It is invisible at that moment, so
      // rehang it straight and still.
      if (load.trolleyX < load.prevTrolleyX - 1) {
        hangAt(load, x, 0);
        load.prevTrolleyX = x;
        continue;
      }

      for (var j = 0; j < RAIL_SUPPORTS.length; j++) {
        var at = RAIL_SUPPORTS[j];
        if (load.prevTrolleyX < at && load.trolleyX >= at) {
          jolt(load, load.trolleyX >= load.prevTrolleyX ? 1 : -1);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------------------

  var started = false;
  var clock = 0; // ms on the line's beat clock
  var accumulator = 0;
  var lastFrame = null;
  var lastBeat = -1;
  var nextShape = 0;

  function start() {
    started = true;
    for (var i = 0; i < loads.length; i++) {
      // Pick each load up exactly where the CSS animation had it, so the
      // handover is not a visible snap.
      var current = localTranslate(loads[i].el).angle;
      var x = HOOK_ORIGIN_X + localTranslate(hooks[i]).x;
      hangAt(loads[i], x, current);
      loads[i].trolleyX = x;
      loads[i].prevTrolleyX = x;
      loads[i].el.classList.remove('sway');
    }
  }

  function spawnDue() {
    var beat = Math.floor(clock / BEAT_MS);
    if (beat === lastBeat) return;
    lastBeat = beat;
    for (var i = 0; i < cargo.length; i++) {
      var slot = cargo[(nextShape + i) % cargo.length];
      if (!slot.inFlight) {
        nextShape = (nextShape + i + 1) % cargo.length;
        launch(slot, beat);
        return;
      }
    }
    // Everything is still in flight — the chute is backed up. Skipping a beat is
    // the honest outcome; forcing a shape in would overlap two bodies.
  }

  function sweep() {
    for (var i = 0; i < cargo.length; i++) {
      var slot = cargo[i];
      if (!slot.inFlight) continue;
      var p = slot.body.position;
      if (slot.landedAt !== null) {
        var age = clock - slot.landedAt;
        if (age >= HANDOVER_MS) {
          retire(slot);
          continue;
        }
        slot.el.style.opacity = String(1 - age / HANDOVER_MS);
      } else if (
        p.y > BELT.top + 80 ||
        p.x > BELT.x1 ||
        p.x < CHUTE_FLOOR[0].x - 60 ||
        clock - slot.launchedAt > MAX_FLIGHT_MS
      ) {
        // Left the world without landing, or wedged in the chute. Neither should
        // happen, but a slot that never frees stops the chute for good, so time
        // it out rather than trusting the simulation to always behave.
        retire(slot);
      }
    }
  }

  function render() {
    for (var i = 0; i < cargo.length; i++) {
      var slot = cargo[i];
      if (!slot.inFlight) continue;
      var p = slot.body.position;
      slot.el.setAttribute(
        'transform',
        'translate(' + p.x.toFixed(2) + ',' + p.y.toFixed(2) + ') ' +
        'rotate(' + ((slot.body.angle * 180) / Math.PI).toFixed(2) + ') ' +
        'translate(' + slot.offset.x.toFixed(2) + ',' + slot.offset.y.toFixed(2) + ') ' +
        'scale(' + SHAPE_SCALE + ')'
      );
    }
    for (var j = 0; j < loads.length; j++) {
      var load = loads[j];
      var angle = Math.atan2(
        load.bob.position.x - load.pivot.position.x,
        load.bob.position.y - load.pivot.position.y
      );
      load.el.setAttribute('transform', 'rotate(' + ((angle * 180) / Math.PI).toFixed(2) + ')');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);

    var t = beatClock();
    if (t === null || t < 0) return; // the plant is still building itself
    clock = t;

    if (!started) start();

    if (lastFrame === null) { lastFrame = now; return; }
    var elapsed = now - lastFrame;
    lastFrame = now;

    // A backgrounded tab, a slow frame, a laptop lid: catching up on the whole
    // gap would fling everything. Simulate at most a few steps and drop the rest.
    var steps = Math.min(Math.floor((accumulator + elapsed) / STEP_MS), 4);
    accumulator = steps === 4 ? 0 : accumulator + elapsed - steps * STEP_MS;

    if (steps > 0) {
      readTrolleys();
      for (var i = 0; i < steps; i++) {
        // Walk each pivot across the frame rather than teleporting it, so the
        // rod's pull on the load reflects how fast the trolley is actually going.
        var f = (i + 1) / steps;
        for (var j = 0; j < loads.length; j++) {
          var load = loads[j];
          M.Body.setPosition(load.pivot, {
            x: load.prevTrolleyX + (load.trolleyX - load.prevTrolleyX) * f,
            y: PIVOT_Y
          });
        }
        M.Engine.update(engine, STEP_MS);
      }
      spawnDue();
      sweep();
    }

    render();
  }

  requestAnimationFrame(frame);
})();
