var G = 6.674e-11
var FPS = 30;
var STEPS_PER_MS = 60000;
var MS_PER_FRAME = Math.floor(1000 / FPS);
var OFFSET = 400;
var AU = 1.496e11;
var SCALE = OFFSET / 2 / AU;

var PLAYER_COLORS = [
    ["#CCCCCC", "#666666"],
    ["#CCFF00", "#99BF00"],
    ["#00CCFF", "#0099BF"],
    ["#FF00CC", "#BF0099"],
    ["#FFCC00", "#BF9900"],
    ["#00FFCC", "#00BF99"],
    ["#CC00FF", "#9900BF"],
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
    return Math.ceil(Math.sqrt(body.size) / 3000);
    //return Mail.ceil(body.size / 2.4397e6);
}

function planetFontSize(ctx, planet) {
  return Math.ceil((14 + planet.growth * 3) * (ctx.canvas.width / 800));
}

function drawBody(ctx, body, color) {
    ctx.beginPath();
    ctx.arc(body.x * SCALE + OFFSET, -body.y * SCALE + OFFSET, bodyRadius(body), 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = PLAYER_COLORS[1][0];
    ctx.fill();
    //ctx.lineWidth = 2;
    //ctx.strokeStyle = PLAYER_COLORS[1][1];
    //ctx.stroke();
    //ctx.font = planetFontSize(ctx, planet) + "px Helvetica";
    //ctx.textAlign = "center";
    //ctx.textBaseline = "middle";
    //ctx.fillStyle = "#000000";
    //ctx.fillText(Math.floor(planet.ships), planet.x, planet.y);
}

function drawSystem(ctx, sun, bodies) {
    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBody(ctx, sun);
    for (var i = 0; i < bodies.length; i++) {
        drawBody(ctx, bodies[i]);
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

function step(sun, bodies) {
  var new_bodies = [];
  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var a = accelerationFromGravity(body, sun);
    var new_x = body.x + body.vx;
    var new_y = body.y + body.vy;
    var new_vx = body.vx + a[0];
    var new_vy = body.vy + a[1];
    new_bodies.push(makeBody(body.mass, new_x, new_y, new_vx, new_vy, body.size));
  }
  return new_bodies;
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
      this.bodies = step(this.sun, this.bodies);
      this.stepCount++;
    }
    this.nextStepAt += 1;
    var that = this;
    setTimeout(function() {
        that.step();
    }, this.nextStepAt - Date.now());
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
