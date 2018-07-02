// The universal gravitational constant.
const G = 6.674e-11;

// The distance from the earth to the sun in meters.
const AU = 1.496e11;

// The mass of the sun in kilograms.
const SOLAR_MASS = 1.989e30;

const SECS_PER_YEAR = 60 * 60 * 24 * 365;

// How many frames to render each second.
const FPS = 60;

// Controls the accuracy of the simulation. Raising this might cause visible
// deviation in orbits. Lowering it might cause animation delay.
const SIM_SECS_PER_STEP = 50;

// How many milliseconds between frames.
const MS_PER_FRAME = 1000 / FPS;

// The factor for scaling distances. The denominator should be slightly higher
// than the furthers distance a planet will be from the sun.
const SCALE = 1 / (2 * AU);

// Colors to use for displaying the planets.
const PLANET_COLORS = [
  '#FFF000', // Sun
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
const BODY_RADIUS = 1.5;

// Draw |body| on the canvas in |ctx|.
function drawBody(ctx, body, color) {
  // (0, 0) is at the top-left of the canvas, so find the offsets needed to
  // center our system
  let xOffset = Math.floor(ctx.canvas.width / 2);
  let yOffset = Math.floor(ctx.canvas.height / 2);
  // Calculate the scaling factor for positioning things.
  let scale = Math.min(xOffset, yOffset) * SCALE;
  // Calculate the (x, y) position of this body on the canvas.
  let x = body.x * scale + xOffset;
  let y = -body.y * scale + yOffset;
  // Draw the circle and fill it with the color.
  ctx.beginPath();
  ctx.arc(x, y, BODY_RADIUS, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = PLANET_COLORS[color];
  ctx.fill();
}

// Draw the entire system on the canvas.
function drawSystem(ctx, sun, bodies) {
  // Clear the canvas.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Check if our window has changed size and update the canvas to match.
  if (ctx.canvas.width !== window.innerWidth) {
    ctx.canvas.width = window.innerWidth;
  }
  if (ctx.canvas.height !== window.innerHeight) {
    ctx.canvas.height = window.innerHeight;
  }
  // Draw the sun.
  drawBody(ctx, sun, 0);
  // Draw the planets.
  for (let i = 0; i < bodies.length; i++) {
    drawBody(ctx, bodies[i], i + 1);
  }
}

// Construct a body object with the given mass, position, velocity, and radius.
function makeBody(mass, x, y, vx, vy, size) {
  return {
    mass,
    x,
    y,
    vx,
    vy,
    size,
  };
}

// Construct a planet body from its size, semi-major axis, eccentricity, and
// radius.
function makePlanet(mass, sma, ecc, size) {
  // Apoapsis.
  let apo = sma * (1 + ecc);
  // Velocity at apoapsis.
  let vApo = Math.sqrt(G * SOLAR_MASS * (2 / apo - 1 / sma));
  return makeBody(mass, 0, apo, vApo, 0, size);
}

// Calculate the acceleration due to gravity on |b1| from |b2|.
function accelerationFromGravity(b1, b2) {
  let dx = b2.x - b1.x;
  let dy = b2.y - b1.y;
  let a = G * b2.mass / Math.pow(dy * dy + dx * dx, 1.5);
  return [dx * a, dy * a];
}

// A SolarSim constructor function.
class SolarSim {
  constructor(ctx, sun, bodies, simYearsPerSec) {
    this.ctx = ctx;
    this.sun = sun;
    this.bodies = bodies;
    this.nextFrameAt = 0;

    const simSecsPerFrame = SECS_PER_YEAR * simYearsPerSec / FPS;
    this.stepsPerFrame = simSecsPerFrame / SIM_SECS_PER_STEP;
    this.simSecsPerStep = simSecsPerFrame / this.stepsPerFrame;
  }

  // Start the simulation.
  start() {
    this.nextFrameAt = Date.now() + MS_PER_FRAME;
    this.render();
  }

  // Perform one step of the simulation.
  step() {
    for (let body of this.bodies) {
      let [ax, ay] = accelerationFromGravity(body, this.sun);
      body.x = body.x + body.vx * this.simSecsPerStep;
      body.y = body.y + body.vy * this.simSecsPerStep;
      body.vx = body.vx + ax * this.simSecsPerStep;
      body.vy = body.vy + ay * this.simSecsPerStep;
    }
  }

  // Renders a frame of the system on the canvas and schedules the next render.
  render() {
    drawSystem(this.ctx, this.sun, this.bodies);
    for (let i = 0; i < this.stepsPerFrame; i++) {
      this.step();
    }
    // Schedule the next frame render for MS_PER_FRAME in the future.
    this.nextFrameAt += MS_PER_FRAME;
    let now = Date.now();
    if (this.nextFrameAt < now) {
      console.warn('Frame calculation is taking longer than one frame.');
      this.nextFrameAt = now + 300;
    }
    setTimeout(() => {
      this.render();
    }, this.nextFrameAt - now);
  }
}
