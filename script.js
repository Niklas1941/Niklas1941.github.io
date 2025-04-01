// Get canvas element and resize it
var c = document.getElementById("myCanvas");
resizeCanvas();
// Telling that it's 2d drawing
var ctx = c.getContext("2d");

// Global variables
let lastCharacters  = "";
let debug           = false;
let vesa            = false;
let gravity         = false;

let run             = true;
let trace           = null;

let TimeStep        = 1;
let prevTimeStep    = TimeStep;

let mouseX = c.width / 2;
let mouseY = c.height / 2;

const gravitationalConstant = 6.67 * Math.pow(10, -8);

// Ball object
class Ball {
  constructor(x, y, v, d, b, _id) {
    this.id = _id;
    this.connections = [];
    this.x = x;
    this.y = y;
    this.direction = d;
    this.velocity = v;
    this.velocityX = this.velocity * Math.cos(this.direction);
    this.velocityY = this.velocity * Math.sin(this.direction);
    this.ballSize = b;
    this.color = "#000";
  }

  ChangeVelocity(velocity) {
    this.velocityX = (this.velocityX / this.velocity) * velocity;
    this.velocityY = (this.velocityY / this.velocity) * velocity;
    this.velocity = velocity;
  }

  UpdateForces() {
    let bs = this.ballSize;
    let velocityApplied = false;

    // Out of bounds
    if (this.x < 0 + bs) {
      this.x = 0 + bs;
    } else if (this.x > c.width - bs) {
      this.x = c.width - bs;
    }

    if (this.y < 0 + bs) {
      this.y = 0 + bs;
    } else if (this.y > c.height - bs) {
      this.y = c.height - bs;
    }

    // Direction change (Can be done in previous if statements)
    if (this.x <= 0 + bs || this.x >= c.width - bs) {
      this.velocityX = -this.velocityX;
      //this.direction = Math.PI - this.direction;
    }

    if (this.y <= 0 + bs || this.y >= c.height - bs) {
      this.velocityY = -this.velocityY;
      //this.direction = Math.PI * 2 - this.direction;
    }

    // Gravity
    if (gravity == true) {
      this.connections.forEach(ball => {
        var dist = Math.pow(ball.x - this.x, 2) + Math.pow(ball.y - this.y, 2);
        var force = 0;
        force =
          (gravitationalConstant * Math.pow(ball.ballSize, 5)) /
          Math.sqrt(dist + dist);
        // Apply movement
        this.velocityX += (ball.x - this.x) * force;
        this.velocityY += (ball.y - this.y) * force;
      });

      this.velocity = Math.sqrt(
        Math.pow(this.velocityX, 2) + Math.pow(this.velocityY, 2)
      );
      this.direction = Math.atan2(this.velocityY, this.velocityX);    
    }
  }

  UpdatePosition(){
    this.x += this.velocityX;
    this.y += this.velocityY;
  }
}

// Make 250 balls
var balls = Array.from(Array(100)).map((_element, _id) => {
  var id = _id;
  var b = Math.random() * 6 + 2;
  var x = Clamp(2 * b, c.width - 2 * b, Math.floor(Math.random() * c.width));
  var y = Clamp(2 * b, c.height - 2 * b, Math.floor(Math.random() * c.height));
  var v = (Math.random() * 1.5 + 0.1) * ((1 / b) * 2);
  var d = Math.random() * Math.PI * 2 + 100;
  return new Ball(x, y, v, d, b, id);
});

// Loop function
function Loop() {
  Update();
}

// Update function
function Update() {
  // Update every balls position
  if (run == true)
    for (var j = 0; j < TimeStep; j++) {
      // Calculate the forces for all of the balls before applying them
      for (var i = 0; i < balls.length; i++) {
        balls[i].UpdateForces();
      }
      // Apply the forces
      for (var i = 0; i < balls.length; i++) {
        balls[i].UpdatePosition();
      }
    }

  if (trace != null && debug) {
    FindBall(trace);
  }
}

function Draw() {
  // Clear canvas
  ctx.clearRect(0, 0, c.width, c.height);

  // Clear balls connections array
  for (var i = 0; i < balls.length; i++) {
    balls[i].connections = [];
  }

  // Draw lines between balls
  for (var i = 0; i < balls.length; i++) {
    for (var j = 0; j < balls.length; j++) {
      // Find if these two have a connection already
      let con = balls[i].connections.includes(balls[j]);
      let dis = Distance(balls[i], balls[j], 150);
      if (i != j && dis && !con) {
        balls[i].connections.push(balls[j]);
        balls[j].connections.push(balls[i]);
        if (!vesa) {
          ctx.beginPath();
          ctx.moveTo(balls[j].x, balls[j].y);
          ctx.lineTo(balls[i].x, balls[i].y);
          ctx.lineWidth = 0.2;
          ctx.strokeStyle = "#000";
          ctx.stroke();
        }
      }
    }
  }

  if (!vesa) {
    // Draw the balls
    for (var i = 0; i < balls.length; i++) {
      ctx.beginPath();
      ctx.arc(balls[i].x, balls[i].y, balls[i].ballSize, 0, 2 * Math.PI);
      ctx.fillStyle = balls[i].color;
      ctx.fill();
    }
  } else {
    ctx.font = "15px Arial";
    let dText = [];
    for (var i = 0; i < balls.length; i++) {
      dText.push("balls[" + i + "]: x:" + balls[i].x + "\t, y: " + balls[i].y);
    }

    var textHeight = 15;
    var textXPosition = 10;
    var textYPostiton = 15;

    for (var i = 0; i < dText.length; i++) {
      ctx.fillText(dText[i], textXPosition, textYPostiton);
      if (textYPostiton >= c.height) {
        textYPostiton = 15;
        textXPosition += 450;
      } else {
        textYPostiton += textHeight;
      }
    }
  }

  //Fast Debug
  if (debug) {
    ctx.font = "15px Arial";

    let dText = [];
    dText.push("TimeStep: " + TimeStep);
    dText.push(trace != null ? "Selected ball id: " + trace.id : "");
    dText.push(
      trace != null
        ? "Position(X:Y): " + Math.round(trace.x) + ":" + Math.round(trace.y)
        : ""
    );
    dText.push(
      trace != null
        ? "Celoxity(X:Y): " +
            trace.velocityX.toFixed(2) +
            ":" +
            trace.velocityY.toFixed(2)
        : ""
    );
    dText.push(trace != null ? "direction: " + trace.direction : "");
    dText.push(
      trace != null
        ? "vector angle: " + Math.atan2(mouseX - trace.x, mouseY - trace.y)
        : ""
    );
    dText.push("Last typed characters: " + lastCharacters);
    dText.push("mouse position(X:Y): " + mouseX + ":" + mouseY);

    ctx.fillStyle = "#000";

    var textStartPoint = 20;

    for (var i = 0; i < dText.length; i++) {
      if (dText[i] != "") {
        ctx.fillText(dText[i], 10, textStartPoint);
        textStartPoint += 15;
      }
    }
    // Draw velocity vector
    for (var i = 0; i < balls.length; i++) {
      ctx.beginPath();
      ctx.moveTo(balls[i].x, balls[i].y);
      ctx.lineTo(
        balls[i].x + Math.cos(balls[i].direction) * balls[i].velocity * 10,
        balls[i].y + Math.sin(balls[i].direction) * balls[i].velocity * 10
      );
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#0F0";
      ctx.stroke();
    }
  }

  // Made by
  ctx.font = "15px Arial";
  let txt = "© Niko Heikkinen 2019";
  ctx.fillStyle = "#000";
  ctx.fillText(txt, c.width - ctx.measureText(txt).width - 5, c.height - 5);
  window.requestAnimationFrame(Draw);
}

// Just a helper function that is used in one place for now
function Clamp(a, b, x) {
  return x > a ? (x < b ? x : b) : a;
}

// Function that puts every ball in the center
function Explode() {
  for (i = 0; i < balls.length; i++) {
    balls[i].x = c.width / 2;
    balls[i].y = c.height / 2;
  }
}

// Calculates the distance to other balls
function Distance(a, b, distance) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  // First check the distance roughly to little optimise calculations
  if (dx < distance && dx > -distance && dy < distance && dy > -distance) {
    // After calculating that it could be close enough then do the more presice calculation
    const dis = Math.hypot(dx, dy);
    if (dis < distance) {
      return dis;
    }
  }
  return false;
}

// Just to run and stop the updating (Basically obselete, because TimeStep)
function Run(tf) {
  if (tf == null) {
    if (run) {
      run = false;
    } else {
      run = true;
    }
  } else {
    run = tf;
  }
}

// Pretty self explanatory
function TraceConnections(_id) {
  if (_id instanceof Ball) {
    trace = _id;
  } else if (_id == "fastest") {
    var fastest = balls[0];
    for (var t = 0; t < balls.length; t++) {
      if (fastest.velocity < balls[t].velocity) {
        fastest = balls[t];
      }
    }

    trace = fastest;
    return fastest.id;
  } else {
    trace = null;
    ClearFind();
    return "reseted trace";
  }
}

// This is the function to find the ball and colors the connections
function FindBall(_id) {
  ClearFind();
  if (_id instanceof Ball) {
    _id.color = "#0f0";
    for (var i = 0; i < _id.connections.length; i++) {
      let d = (balls[_id.connections[i]].color = "#f00");
    }

    return _id.connections.length;
  } else if (_id == null) {
    return "No id given!";
  } else {
    balls[_id].color = "#f00";
    return balls[_id];
  }
}

// Self explanatory
function ClearFind() {
  for (var i = 0; i < balls.length; i++) {
    balls[i].color = "#000";
  }
}

// Enables user the ability to click ball and show the connections
function selectBall(event) {
  for (var i = 0; i < balls.length; i++) {
    if (
      event.clientX < balls[i].x + balls[i].ballSize &&
      event.clientX > balls[i].x - balls[i].ballSize &&
      event.clientY < balls[i].y + balls[i].ballSize &&
      event.clientY > balls[i].y - balls[i].ballSize
    ) {
      TraceConnections(balls[i]);
      return;
    }
  }
  TraceConnections();
}

function convertRange(value, r1, r2) {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
}

// Self explanatory
function resizeCanvas() {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}

// Event listeners for buttons that can be held down
document.addEventListener("keydown", function(event) {
  if (event.code == "NumpadAdd" || event.key == "+") {
    TimeStep += 1;
    console.log("Time step increased to " + TimeStep);
  } else if (event.code == "NumpadSubtract" || event.key == "-") {
    TimeStep -= 1;
    console.log("Time step decreased to " + TimeStep);
  }
  // This need to be in held section because it can't be detected in press listener
  // "Steps" by 1 frame/update
  else if (event.code == "ArrowUp" && TimeStep < 1) {
    TimeStep = 1;
    Update();
    TimeStep = 0;
    console.log("stepped");
  } else if (event.code == "Space") {
    if (TimeStep != 0) {
      prevTimeStep = TimeStep;
      TimeStep = 0;
    } else {
      TimeStep = prevTimeStep;
    }
  }
});

// Event listener that logs last 10 buttons pressed
document.addEventListener("keypress", function(event) {
  lastCharacters += event.key;
  if (lastCharacters.length >= 10) {
    lastCharacters = lastCharacters.substring(
      lastCharacters.length - 10,
      lastCharacters.length
    );
  }

  let sLength = lastCharacters.length;
  // if the last 3 chars type dev then open debug
  if (lastCharacters.substring(sLength - 3, sLength) === "dev") {
    debug = !debug;
    ClearFind();
  }

  if (lastCharacters.substring(sLength - 4, sLength) === "vesa") {
    vesa = !vesa;
  }

  if (lastCharacters.substring(sLength - 4, sLength) === "grav") {
    gravity = !gravity;
  }
});

c.addEventListener("mousemove", function(e) {
  var cRect = c.getBoundingClientRect();
  mouseX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
  mouseY = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
});

// If clicked somewhere then do this
document.addEventListener("click", selectBall);
// Resize listener
window.addEventListener("resize", resizeCanvas);

// Run the Loop function 60 per second and draw it
setInterval(Loop, 1000 / 60);
window.requestAnimationFrame(Draw);
