// The universal gravitational constant.
const G = 6.674e-11;

// The distance from the earth to the sun in meters.
const AU = 1.496e11;

// Define the sun and planets using values from Wikipedia.
const SUN = makeBody('#FFF000', 1.989e30, 0, 0, 0, 0);
const MERCURY = makePlanet('#FF00AA', 3.3011e23, 5.7909e10, 0.205630);
const VENUS = makePlanet('#84FF00', 4.8675e24, 1.0820e11, 0.006772);
const EARTH = makePlanet('#00B3FF', 5.972e24, 1.4960e11, 0.0167086);
const MARS = makePlanet('#FF0000', 6.4171e23, 2.2793e11, 0.0934);
const JUPITER = makePlanet('#F2B50C', 1.8986e27, 7.7829e11, 0.048498);
const SATURN = makePlanet('#BB00FF', 5.56836e26, 1.4294e12, 0.05555);
const URANUS = makePlanet('#6DF29E', 8.6810e25, 2.87504e12, 0.046381);
const NEPTUNE = makePlanet('#0779B8', 1.0243e26, 4.50445e12, 0.009456);
const PLUTO = makePlanet('#AAAAAA', 1.303e22, 5.915e12, 0.24905);

// Controls the accuracy of the simulation. Raising this might cause visible
// deviation in orbits. Lowering it might cause animation delay.
const SIM_SECS_PER_STEP = 1000;

// Controls the speed of the simulation. Raising this too high might cause
// animation delay.
//const SIM_SECS_PER_MS = 2e4;
const SIM_SECS_PER_MS = 10000;

// How many steps to computed per real millisecond.
const STEPS_PER_MS = SIM_SECS_PER_MS / SIM_SECS_PER_STEP

// Calculate the body radius in pixels.
const BODY_RADIUS_PX = 4;

function startSimulation(ctx, inputBodies, mouseObject, r) {
  const scale = 1 / r;

  const planets = inputBodies.map(planet => makeBody(
    planet.color,
    planet.mass,
    Math.random() * r - r / 2,
    Math.random() * r - r / 2,
    0,
    0
  ));

  function updateAndRender(elapsedMs) {
    const numSteps = STEPS_PER_MS * elapsedMs;
    for (let i = 0; i < numSteps; i++) {
      step(planets, mouseObject);
    }
    draw(ctx, scale, planets);
  }

  return simulate(updateAndRender);
}

// Construct a planet body from its mass, semi-major axis, and eccentricity.
function makePlanet(color, mass, sma, ecc) {
  // Apoapsis.
  const apo = sma * (1 + ecc);
  // Velocity at apoapsis.
  const vApo = Math.sqrt(G * SUN.mass * (2 / apo - 1 / sma));
  return makeBody(color, mass, 0, apo, vApo, 0);
}

// Construct a body object with the given mass, position, and velocity.
function makeBody(color, mass, x, y, vx, vy) {
  return { color, mass, x, y, vx, vy };
}

// Draw the entire system on the canvas.
function draw(ctx, scale, bodies) {
  // Clear the canvas.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw the bodies.
  for (const body of bodies) {
    drawBody(ctx, scale, body);
  }
}

// Draw |body| on the canvas in |ctx|.
function drawBody(ctx, scale, body) {
  // (0, 0) is at the top-left of the canvas, so find the offsets needed to
  // center our system
  const xOffset = Math.floor(ctx.canvas.width / 2);
  const yOffset = Math.floor(ctx.canvas.height / 2);
  // Calculate the scaling factor for positioning things.
  const scaleFactor = Math.min(xOffset, yOffset) * scale;
  // Calculate the (x, y) position of this body on the canvas.
  const x = body.x * scaleFactor + xOffset;
  const y = -body.y * scaleFactor + yOffset;
  // Draw the circle and fill it with the color.
  ctx.beginPath();
  ctx.arc(x, y, BODY_RADIUS_PX, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = body.color;
  ctx.fill();
}

// Perform one step of the simulation.
function step(planets, mouseObject) {
  const objects = [...planets, mouseObject];
  const forces = objects.map(() => [0, 0]);
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const [fx, fy] = forceFromGravity(objects[i], objects[j]);
      forces[i][0] += fx;
      forces[i][1] += fy;
      forces[j][0] -= fx;
      forces[j][1] -= fy;
    }
  }

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    planet.x = planet.x + planet.vx * SIM_SECS_PER_STEP;
    planet.y = planet.y + planet.vy * SIM_SECS_PER_STEP;
    planet.vx = planet.vx + forces[i][0] / planet.mass * SIM_SECS_PER_STEP;
    planet.vy = planet.vy + forces[i][1] / planet.mass * SIM_SECS_PER_STEP;
  }
}

// Calculate the force due to gravity between |b1| and |b2|.
function forceFromGravity(b1, b2) {
  const minR = 1e8;
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  let r = Math.sqrt(dy * dy + dx * dx);
  if (r < minR) {
    r = minR;
  }
  const f = G * b1.mass * b2.mass / (r * r);
  // dx / r is the cos, dy / r is the sin.
  return [f * dx / r, f * dy / r];
}

/**
 * Generic function for starting and stoping a simulation.
 *
 * @param next The function that renders a frame of the animation. Should
 *             accept the elapsed time since last invocation in ms.
 */
function simulate(next) {
  let lastMs;
  let frameId;

  // Renders a frame of the system on the canvas and schedules the next render.
  function render(totalMs = 0) {
    lastMs = lastMs || totalMs;
    const elapsedMs = totalMs - lastMs;
    lastMs = totalMs;
    // If it's been more than a second, skip this frame.
    if (elapsedMs < 1000) {
      next(elapsedMs);
    }

    frameId = requestAnimationFrame(render);
  }

  render();

  return () => cancelAnimationFrame(frameId);
}
