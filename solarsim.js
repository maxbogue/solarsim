var G = 6.674e-11
var FPS = 60;
var SECS_PER_STEP = 10;
var STEPS_PER_MS = 10000;
var MS_PER_FRAME = Math.floor(1000 / FPS);
var AU = 1.496e11;
var SCALE = 1 / 31 / AU;
var SOLAR_MASS = 1.989e30;

var PLANET_COLORS = [
    "#FFF000",
    "#E37242",
    "#BF290B",
    "#18A8A7",
    "#A84E32",
    "#F55B47",
    "#E3AC09",
    "#65CEE6",
    "#0779B8",
];

function extend(dest, source) {
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
            var value = source[k];
            if (dest.hasOwnProperty(k) &&
                    typeof dest[k] === "object" &&
                    typeof value === "object") {
                extend(dest[k], value);
            } else {
                dest[k] = value;
            }
        }
    }
    return dest;
}

function dist(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function bodyRadius(body) {
    return 1.5;
}

function planetFontSize(ctx, planet) {
  return Math.ceil((14 + planet.growth * 3) * (ctx.canvas.width / 800));
}

function drawBody(ctx, body, color) {
    var xOffset = Math.floor(ctx.canvas.width / 2);
    var yOffset = Math.floor(ctx.canvas.height / 2);
    var scale = Math.min(xOffset, yOffset) * SCALE;
    var x = body.x * scale + xOffset;
    var y = -body.y * scale + yOffset;
    ctx.beginPath();
    ctx.arc(x, y, bodyRadius(body), 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = PLANET_COLORS[color];
    ctx.fill();
}

function drawSystem(ctx, sun, bodies) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (ctx.canvas.width != window.innerWidth) {
        ctx.canvas.width  = window.innerWidth;
    }
    if (ctx.canvas.height != window.innerHeight) {
        ctx.canvas.height = window.innerHeight;
    }
    drawBody(ctx, sun, 0);
    for (var i = 0; i < bodies.length; i++) {
        drawBody(ctx, bodies[i], i + 1);
    }
}

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

function makePlanet(mass, a, e, size) {
  var p = a * (1 - e);
  var vp = Math.sqrt(G * SOLAR_MASS * (2 / p - 1 / a));
  return makeBody(mass, 0, p, vp, 0, size);
}

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

function accelerationFromGravity(b1, b2) {
  var dx = b2.x - b1.x;
  var dy = b2.y - b1.y;
  var a = G * b2.mass / Math.pow(dy * dy + dx * dx, 1.5);
  return [dx * a, dy * a];
}
  
function SolarSim(ctx, sun, bodies) {
    this.ctx = ctx;
    this.sun = sun;
    this.bodies = bodies
    this.stepCount = 0;
    this.frameCount = 0;
    this.nextStepAt = 0;
    this.nextFrameAt = 0;
}

SolarSim.prototype.start = function() {
    this.nextStepAt = Date.now();
    this.nextFrameAt = Date.now();
    this.render();
    this.step();
}

SolarSim.prototype.step = function() {
    for (var i = 0; i < STEPS_PER_MS; i++) {
      step(this.sun, this.bodies);
      this.stepCount++;
    }
    this.nextStepAt += 1;
    var that = this;
    var dt = this.nextFrameAt - Date.now();
    //console.log(dt);
    setTimeout(function() {
        that.step();
    }, dt);
}

SolarSim.prototype.render = function() {
    drawSystem(this.ctx, this.sun, this.bodies);
    this.frameCount++;
    this.nextFrameAt += MS_PER_FRAME;
    var that = this;
    setTimeout(function() {
        that.render();
    }, this.nextFrameAt - Date.now());
}
