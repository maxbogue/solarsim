function startSimulation(ctx) {
  const objects = [
    { x: 0, y: 0, r: 4, color: '#ff0000' },
  ];
  const state = { objects };

  function updateAndRender(count) {
    step(state, count);
    draw(ctx, state);
  }

  return simulate(updateAndRender);
}

// Perform one step of the simulation.
function step(state, count) {
  for (const object of state.objects) {
  }
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

/**
 * Generic function for starting and stoping a simulation.
 *
 * @param next The function that renders a frame of the animation.
 */
function simulate(next) {
  let frameId;
  let count = 0;

  // Renders a frame of the system on the canvas and schedules the next render.
  function render() {
    count++;
    next(count);
    frameId = requestAnimationFrame(render);
  }

  render();
  return () => cancelAnimationFrame(frameId);
}
