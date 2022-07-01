// Perform one step of the simulation.
function step(state, elapsedMs, count) {
  for (const object of state.objects) {
  }
}

// Draw |object| on the canvas in |ctx|.
function drawObject(ctx, object) {
  const xOffset = ctx.canvas.width / 2
  const yOffset = ctx.canvas.height / 2;
  // Draw the object and fill it with the color.
  ctx.beginPath();
  ctx.arc(object.x + xOffset, object.y + yOffset, object.r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = object.color;
  ctx.fill();
}

// Draw the entire system on the canvas.
function draw(ctx, state) {
  // Clear the canvas.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw the bodies.
  for (const object of state.objects) {
    drawObject(ctx, object);
  }
}

function startSimulation(ctx) {
  const objects = [
    { x: 0, y: 0, r: 4, color: '#ff0000' },
  ];
  const state = { objects };

  function updateAndRender(elapsedMs, count) {
    step(state, elapsedMs, count);
    draw(ctx, state);
  }

  return simulate(updateAndRender);
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
