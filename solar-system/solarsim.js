// The universal gravitational constant.
const G = 6.674e-11;

// The distance from the earth to the sun in meters.
const AU = 1.496e11;

// The mass of the sun in kilograms.
const SOLAR_MASS = 1.989e30;

// The number of seconds in a year.
const SECS_PER_YEAR = 60 * 60 * 24 * 365;

// How many frames to render each second.
const FPS = 60;

// How many milliseconds between frames.
const MS_PER_FRAME = 1000 / FPS;

// Controls the accuracy of the simulation. Raising this might cause visible
// deviation in orbits. Lowering it might cause animation delay.
const SIM_SECS_PER_STEP = 100;

// Controls the speed of the simulation. Raising this too high might cause
// animation delay.
const SIM_SECS_PER_MS = 2e4;

// How many steps to computed per real millisecond.
const STEPS_PER_MS = SIM_SECS_PER_MS / SIM_SECS_PER_STEP

const SUN_COLOR = '#FFF000';

// Colors to use for displaying the planets.
const PLANET_COLORS = [
  '#FF00AA', // Mercury
  '#84FF00', // Venus
  '#00B3FF', // Earth
  '#FF0000', // Mars
  '#F2B50C', // Jupiter
  '#BB00FF', // Saturn
  '#6DF29E', // Uranus
  '#0779B8', // Neptune
  '#AAAAAA', // Pluto
];

// Calculate the body radius in pixels.
const BODY_RADIUS_PX = 1.5;

// Draw |body| on the canvas in |ctx|.
function drawBody(ctx, scale, body, color) {
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
  ctx.fillStyle = color;
  ctx.fill();
}

// Draw the entire system on the canvas.
function drawSystem(ctx, scale, sun, planets) {
  // Clear the canvas.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw the sun.
  drawBody(ctx, scale, sun, SUN_COLOR);
  // Draw the planets.
  for (let i = 0; i < planets.length; i++) {
    drawBody(ctx, scale, planets[i], PLANET_COLORS[i]);
  }
}

// Construct a body object with the given mass, position, and velocity.
function makeBody(mass, x, y, vx, vy) {
  return {
    mass,
    x,
    y,
    vx,
    vy,
  };
}

// Construct a planet body from its mass, semi-major axis, and eccentricity.
function makePlanet(mass, sma, ecc) {
  // Apoapsis.
  const apo = sma * (1 + ecc);
  // Velocity at apoapsis.
  const vApo = Math.sqrt(G * SOLAR_MASS * (2 / apo - 1 / sma));
  return makeBody(mass, 0, apo, vApo, 0);
}

// Calculate the acceleration due to gravity on |b1| from |b2|.
function accelerationFromGravity(b1, b2) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const r = Math.sqrt(dy * dy + dx * dx);
  const a = G * b2.mass / (r * r);
  return [a * dx / r, a * dy / r];
}

function simulate(f) {
  let lastMs = 0;

  // Renders a frame of the system on the canvas and schedules the next render.
  function render(totalMs = 0) {
    const elapsedMs = totalMs - lastMs;
    lastMs = totalMs;
    // If it's been more than a second, skip this frame.
    if (elapsedMs < 1000) {
      f(elapsedMs);
    }
    requestAnimationFrame(render);
  }

  render();
}

function startSolarSim(ctx, sun, planets) {
  // Find the furthest planet's distance.
  const maxDist = planets.reduce((acc, b) => Math.max(acc, b.y), 0);
  const scale = 1 / (maxDist * 1.05); // 5% padding.

  // Perform one step of the simulation.
  function step() {
    for (const planet of planets) {
      const [ax, ay] = accelerationFromGravity(planet, sun);
      planet.x = planet.x + planet.vx * SIM_SECS_PER_STEP;
      planet.y = planet.y + planet.vy * SIM_SECS_PER_STEP;
      planet.vx = planet.vx + ax * SIM_SECS_PER_STEP;
      planet.vy = planet.vy + ay * SIM_SECS_PER_STEP;
    }
  }

  function updateAndRender(elapsedMs) {
    const numSteps = STEPS_PER_MS * elapsedMs;
    for (let i = 0; i < numSteps; i++) {
      step();
    }
    drawSystem(ctx, scale, sun, planets);
  }

  simulate(updateAndRender);
}
