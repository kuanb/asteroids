
// create the canvas
var canvas   = document.createElement('canvas');
var ctx      = canvas.getContext('2d');

// dump in body
document.body.style.margin  = '0';
document.body.style.padding = '0';
document.body.appendChild(canvas);

var resizeCanvas = function() {
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
};

// resize on load and listen for window change
window.onresize = resizeCanvas;
resizeCanvas();

// make a vector class
function Vector(x, y) {
	this.x = x;
	this.y = y;

	this.rotate = function(center, angle) {
		angle = (angle) * (Math.PI/180);
		var rotatedX = Math.cos(angle) * (this.x - center.x) - Math.sin(angle) * (this.y-center.y) + center.x;
		var rotatedY = Math.sin(angle) * (this.x - center.x) + Math.cos(angle) * (this.y - center.y) + center.y;
		this.x = rotatedX;
		this.y = rotatedY;
		return this;
	};
	this.clone = function() {
		return new Vector(this.x, this.y);
	}
};

// now a class for all space objects (ships, asteroids, lazers)
function spaceObj(loc, dir) {
	this.location = loc;
	this.direction = dir;
	this.angle = 0;
	this.speed = 0;
	this.scale = 1;
}

// the ship object
var ship = new spaceObj(new Vector(canvas.width/2, canvas.height/2), new Vector(0, 0));

// global (interstellar?) array of asteroids in space
var asteroids = [];
var lasers = [];
var approachRate = 0;

APP = {};

APP.core = {
	then: Date.now(),
	now: Date.now(),
	delta: 0,
	
	frame: function() {
		APP.core.setApproach();
		APP.core.setDelta();
		APP.core.populate();
		APP.core.update();
		APP.core.render();
		APP.core.animationFrame = window.requestAnimationFrame(APP.core.frame);
	},
	setApproach: function() {
		approachRate = document.getElementById('rate').value/200;
	},
	setDelta: function() {
		APP.core.now = Date.now();
		APP.core.delta = (APP.core.now - APP.core.then) / 1000;
		APP.core.then = APP.core.now;
	},
	populate: function() {
		if (Math.random() < approachRate) {
			random = Math.random()
			if (random < 0.25) {
				var asteroid = new spaceObj(new Vector(0, canvas.height*Math.random()), new Vector((Math.random()-0.5)*40, (Math.random()-0.5)*40));
			}
			else if (random > 0.25 && random < 0.5) {
				var asteroid = new spaceObj(new Vector(canvas.width, canvas.height*Math.random()), new Vector((Math.random()-0.5)*40, (Math.random()-0.5)*40));
			}
			else if (random > 0.5 && random < 0.75) {
				var asteroid = new spaceObj(new Vector(canvas.width*Math.random(), 0), new Vector((Math.random()-0.5)*40, (Math.random()-0.5)*40));
			}
			else {
				var asteroid = new spaceObj(new Vector(canvas.width*Math.random(), canvas.height), new Vector((Math.random()-0.5)*40, (Math.random()-0.5)*40));
			}
			asteroid.angle = Math.random()*360;
			asteroid.scale = Math.random()*2+0.5;
			asteroid.speed = new Vector(Math.random()*3, Math.random()*3)
			asteroids.push(asteroid);
		}
	},
	update: function() {

		// handle the space ship
		var dx = ship.direction.x * APP.core.delta;
		ship.location.x = ship.location.x + dx;

		var dy = ship.direction.y * APP.core.delta; 
		ship.location.y = ship.location.y + dy;

		if (ship.location.x > canvas.width) {
			ship.location.x = 0 }

		else if (ship.location.x < 0) {
			ship.location.x = canvas.width }

		else if (ship.location.y > canvas.height) {
			ship.location.y = 0 }

		else if (ship.location.y < 0) {
			ship.location.y = canvas.height }

		// update all the asteroids
		for (var i=0; i < asteroids.length; i++) {

			// slow rotation of space rocks
			if (asteroids[i].angle < 360/2) {
				asteroids[i].angle -= 0.5;
			}
			else if (asteroids[i].angle >= 360/2) {
				asteroids[i].angle += 0.5;
			};

			var dx = asteroids[i].direction.x * asteroids[i].speed.x * APP.core.delta;
			asteroids[i].location.x = asteroids[i].location.x + dx;

			var dy = asteroids[i].direction.y * asteroids[i].speed.y * APP.core.delta; 
			asteroids[i].location.y = asteroids[i].location.y + dy;

			if (asteroids[i].location.x > canvas.width) {
				asteroids.splice(i, 1) }

			else if (asteroids[i].location.x < 0) {
				asteroids.splice(i, 1) }

			else if (asteroids[i].location.y > canvas.height) {
				asteroids.splice(i, 1) }

			else if (asteroids[i].location.y < 0) {
				asteroids.splice(i, 1) }
		};

		// update all the laser beams
		for (var i=0; i < lasers.length; i++) {

			var dx = lasers[i].direction.x * lasers[i].speed.x * APP.core.delta;
			lasers[i].location.x = lasers[i].location.x + dx;

			var dy = lasers[i].direction.y * lasers[i].speed.y * APP.core.delta; 
			lasers[i].location.y = lasers[i].location.y + dy;

			if (lasers[i].location.x > canvas.width) {
				lasers.splice(i, 1) }

			else if (lasers[i].location.x < 0) {
				lasers.splice(i, 1) }

			else if (lasers[i].location.y > canvas.height) {
				lasers.splice(i, 1) }

			else if (lasers[i].location.y < 0) {
				lasers.splice(i, 1) }
		}
	},
	render: function() {
		ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		ctx.shadowBlur = 0;
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fill();
		drawShip(ship);
		for (var i=0; i < asteroids.length; i++) {
			drawAsteroid(asteroids[i]);
		};
		for (var i=0; i < lasers.length; i++) {
			drawLaser(lasers[i]);
		}
	}
}

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') {
     	ship.direction.y -= 5*Math.cos((ship.angle) * (Math.PI/180));
     	ship.direction.x += 5*Math.sin((ship.angle) * (Math.PI/180));
    }
    else if (e.keyCode == '37') {
        ship.angle -= 5
    }
    else if (e.keyCode == '39') {
        ship.angle += 5
    }
    else if (e.keyCode == '32') {
        var laser = new spaceObj(ship.location.clone(), ship.direction.clone());
        laser.speed = new Vector(5, 5);
        laser.angle = ship.angle;
        lasers.push(laser)
    }
}

// make a fucking spaceship
function drawShip(ship) {

	ctx.beginPath();
	ctx.moveTo(ship.location.x, ship.location.y);

	var backRight = ship.location.clone();
	backRight.x += 10;
	backRight.y += 20;
	backRight.rotate(ship.location, ship.angle);

	ctx.lineTo(backRight.x,backRight.y);
    
    var backMiddleL = ship.location.clone();
	backMiddleL.x += 3;
	backMiddleL.y += 15;
	backMiddleL.rotate(ship.location, ship.angle);	

    ctx.lineTo(backMiddleL.x,backMiddleL.y);
    
    var backMiddleR = ship.location.clone();
    backMiddleR.x -= 3;
	backMiddleR.y += 15;
	backMiddleR.rotate(ship.location, ship.angle);	

    ctx.lineTo(backMiddleR.x,backMiddleR.y);
    
	var backLeft = ship.location.clone();
	backLeft.x -= 10;
	backLeft.y += 20;
	backLeft.rotate(ship.location, ship.angle);	

    ctx.lineTo(backLeft.x,backLeft.y);

    ctx.lineTo(ship.location.x,ship.location.y);

	ctx.strokeStyle = 'red';
	ctx.shadowColor = 'red';
	ctx.shadowBlur = 10;
	ctx.stroke();
	ctx.closePath();
};


// make a tons of space rocks
function drawAsteroid(roid) {

	ctx.beginPath();
	ctx.moveTo(roid.location.x, roid.location.y);

	var backRight = roid.location.clone();
	backRight.x += 20*roid.scale;
	backRight.y += 17*roid.scale;
	backRight.rotate(roid.location, roid.angle);

	ctx.lineTo(backRight.x,backRight.y);
    
    var backMiddleL = roid.location.clone();
	backMiddleL.x += 10*roid.scale;
	backMiddleL.y += 40*roid.scale;
	backMiddleL.rotate(roid.location, roid.angle);	

    ctx.lineTo(backMiddleL.x,backMiddleL.y);
    
    var backMiddleR = roid.location.clone();
    backMiddleR.x -= 10*roid.scale;
	backMiddleR.y += 40*roid.scale;
	backMiddleR.rotate(roid.location, roid.angle);	

    ctx.lineTo(backMiddleR.x,backMiddleR.y);
    
	var backLeft = roid.location.clone();
	backLeft.x -= 20*roid.scale;
	backLeft.y += 17*roid.scale;
	backLeft.rotate(roid.location, roid.angle);	

    ctx.lineTo(backLeft.x,backLeft.y);

    ctx.lineTo(roid.location.x,roid.location.y);

	ctx.strokeStyle = 'orange';
	ctx.shadowColor = 'orange';
	ctx.shadowBlur = 10;
	ctx.stroke();
	ctx.closePath();
};


// blast dem lasers
function drawLaser(lzr, scale) {

	ctx.beginPath();
	ctx.moveTo(lzr.location.x, lzr.location.y);

	var endBeam = lzr.location.clone();
	endBeam.x += 0;
	endBeam.y += 10;
	endBeam.rotate(lzr.location, lzr.angle);

	ctx.lineTo(endBeam.x,endBeam.y);

    ctx.lineTo(lzr.location.x,lzr.location.y);

	ctx.strokeStyle = 'blue';
	ctx.shadowColor = 'blue';
	ctx.shadowBlur = 10;
	ctx.stroke();
	ctx.closePath();
};

document.onkeydown = checkKey;
APP.core.frame()