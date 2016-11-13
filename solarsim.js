// How many frames to render each second.
var FPS = 60;

// How many seconds to simulate per step. Increasing this increases the
// simulation speed without taking more processing power.
var SECS_PER_STEP = 60;

// How many steps to perform per millisecond. Increasing this numeber will stop
// having an affect once the computer can't do the steps fast enough.
var STEPS_PER_MS = 500;

// How many milliseconds between frames.
var MS_PER_FRAME = Math.floor(1000 / FPS);

// The universal gravitational constant.
var G = 6.674e-11;

// The distance from the earth to the sun in meters.
var AU = 1.496e11;

// The factor for scaling distances. The denominator should be slightly higher
// than the furthers distance a planet will be from the sun.
var SCALE = 1 / (2 * AU);

// The mass of the sun in kilograms.
var SOLAR_MASS = 1.989e30;

// Colors to use for displaying the planets.
var PLANET_COLORS = [
    "#FFF000", // Sun
    "#FF00AA", // Mercury
    "#84FF00", // Venus
    "#00B3FF", // Earth
    "#FF0000", // Mars
    "#F2B50C", // Jupiter
    "#BB00FF", // Saturn
    "#6DF29E", // Uranus
    "#0779B8", // Neptune
    "#AAAAAA", // Pluto
];

// Calculate the radius in pixels to display the body.
function bodyRadius(body) {
    return 1.5;
}

// Draw |body| on the canvas in |ctx|.
function drawBody(ctx, body, color) {
    // (0, 0) is at the top-left of the canvas, so find the offsets needed to
    // center our system
    var xOffset = Math.floor(ctx.canvas.width / 2);
    var yOffset = Math.floor(ctx.canvas.height / 2);
    // Calculate the scaling factor for positioning things.
    var scale = Math.min(xOffset, yOffset) * SCALE;
    // Calculate the (x, y) position of this body on the canvas.
    var x = body.x * scale + xOffset;
    var y = -body.y * scale + yOffset;
    // Draw the circle and fill it with the color.
    ctx.beginPath();
    ctx.arc(x, y, bodyRadius(body), 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = PLANET_COLORS[color];
    ctx.fill();
}

// Draw the entire system on the canvas.
function drawSystem(ctx, sun, bodies) {
    // Clear the canvas.
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Check if our window has changed size and update the canvas to match.
    if (ctx.canvas.width != window.innerWidth) {
        ctx.canvas.width  = window.innerWidth;
    }
    if (ctx.canvas.height != window.innerHeight) {
        ctx.canvas.height = window.innerHeight;
    }
    // Draw the sun.
    drawBody(ctx, sun, 0);
    // Draw the planets.
    for (var i = 0; i < bodies.length; i++) {
        drawBody(ctx, bodies[i], i + 1);
    }
}

// Construct a body object with the given mass, position, velocity, and radius.
function makeBody(mass, x, y, vx, vy, size) {
  var body = {};
  body.mass = mass;
  body.x = x;
  body.y = y;
  body.vx = vx;
  body.vy = vy;
  body.size = size;
  return body;
}

// Construct a planet body from its size, semi-major axis, eccentricity, and radius.
function makePlanet(mass, a, e, size) {
  var p = a * (1 - e);
  var vp = Math.sqrt(G * SOLAR_MASS * (2 / p - 1 / a));
  return makeBody(mass, 0, p, vp, 0, size);
}

// Perform one step of the simulation. The values in |bodies| are updated.
function step(sun, bodies) {
  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var a = accelerationFromGravity(body, sun);
    body.x = body.x + body.vx * SECS_PER_STEP;
    body.y = body.y + body.vy * SECS_PER_STEP;
    body.vx = body.vx + a[0] * SECS_PER_STEP;
    body.vy = body.vy + a[1] * SECS_PER_STEP;
  }
}

// Calculate the acceleration due to gravity on |b1| from |b2|.
function accelerationFromGravity(b1, b2) {
  var dx = b2.x - b1.x;
  var dy = b2.y - b1.y;
  var a = G * b2.mass / Math.pow(dy * dy + dx * dx, 1.5);
  return [dx * a, dy * a];
}
  
// A SolarSim constructor function.
function SolarSim(ctx, sun, bodies) {
    this.ctx = ctx;
    this.sun = sun;
    this.bodies = bodies
    this.stepCount = 0;
    this.frameCount = 0;
    this.nextStepAt = 0;
    this.nextFrameAt = 0;
}

// Start the simulation.
SolarSim.prototype.start = function() {
    this.nextStepAt = Date.now();
    this.nextFrameAt = Date.now();
    this.render();
    this.step();
}

// Performs a batch of steps and schedules the next batch.
SolarSim.prototype.step = function() {
    // Perform STEPS_PER_MS steps at once.
    for (var i = 0; i < STEPS_PER_MS; i++) {
      step(this.sun, this.bodies);
      this.stepCount++;
    }
    // Schedule the next batch of steps for 1ms in the future.
    this.nextStepAt += 1;
    var that = this;
    setTimeout(function() {
        that.step();
    }, this.nextFrameAt - Date.now());
}

// Renders a frame of the system on the canvas and schedules the next render.
SolarSim.prototype.render = function() {
    drawSystem(this.ctx, this.sun, this.bodies);
    this.frameCount++;
    // Schedule the next frame render for MS_PER_FRAME in the future.
    this.nextFrameAt += MS_PER_FRAME;
    var that = this;
    setTimeout(function() {
        that.render();
    }, this.nextFrameAt - Date.now());
}
