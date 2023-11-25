// Scaling factor for the coordinate system of the simulation.
const SCALE = 15;
// Radius of the balls that are renderd.
const R = 3;

const RHO = 28;
const SIGMA = 10;
const BETA = 8 / 3;

const STEPS_PER_MS = 10
const SECS_PER_STEP = 0.001 / STEPS_PER_MS;

function startSimulation(ctx) {
  const state = [
    { x: 10, y: 10, z: 10, color: '#FFFF00' },
    { x: 10, y: 10, z: 10.000000001, color: '#00B3FF' },
    { x: 10, y: 10, z: 10.000001, color: '#FF0000' },
    { x: 10, y: 10, z: 10.0001, color: '#84FF00' },
  ];

  function updateAndRender(elapsedMs, count) {
    step(state, elapsedMs, count);
    draw(ctx, state);
  }

  return simulate(updateAndRender);
}

// Perform one step of the simulation.
function step(state, elapsedMs, count) {
  const numSteps = elapsedMs * STEPS_PER_MS;
  for (let i = 0; i < numSteps; i++) {
    for (const object of state) {
      const { x, y, z } = object;
      object.x = x + (SIGMA * (y - x)) * SECS_PER_STEP;
      object.y = y + (x * (RHO - z) - y) * SECS_PER_STEP;
      object.z = z + (x * y - BETA * z) * SECS_PER_STEP;
    }
  }
}

// Draw the entire system on the canvas.
function draw(ctx, state) {
  // Clear the canvas.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw the bodies.
  for (const object of state) {
    drawObject(ctx, object);
  }
}

// Draw |object| on the canvas in |ctx|.
function drawObject(ctx, object) {
  const xOffset = ctx.canvas.width / 2
  const yOffset = ctx.canvas.height / 2;
  // Draw the object and fill it with the color.
  ctx.beginPath();
  ctx.arc(object.x * SCALE + xOffset, -object.z * SCALE + yOffset + 300, R, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = object.color;
  ctx.fill();
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
  let count = 0;

  // Renders a frame of the system on the canvas and schedules the next render.
  function render(totalMs = 0) {
    lastMs = lastMs || totalMs;
    const elapsedMs = totalMs - lastMs;
    lastMs = totalMs;
    count++;
    // If it's been more than a second, skip this frame.
    if (elapsedMs < 1000) {
      next(elapsedMs, count);
    }

    frameId = requestAnimationFrame(render);
  }

  render();

  return () => cancelAnimationFrame(frameId);
}
