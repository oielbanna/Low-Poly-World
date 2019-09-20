/*
 * Boid.js
 * Miles Thorogood
 * Adapted from Reynolds and Shiffman for threejs:
 * http://www.red3d.com/cwr/steer/gdc99/
 * https://processing.org/examples/flocking.html
 */

// the Boid definition
function Boid() {
	this.position = new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10);
	this.velocity = new THREE.Vector3(rrand(-0.001, 0.001), rrand(-0.001, 0.001), rrand(-0.001, 0.001));
	this.acceleration = new THREE.Vector3();
	this.mass = 2;
	this.body = new Box();
	this.home = new THREE.Vector3(0, 10, 0);
	// some scalers to control the behaviour
	this.maxforce = 0.03;
	this.maxspeed = 0.001;
	this.sepScale = 0.001;
	this.aliScale = 0.001;
	this.cohScale = 0.001;
	this.homeScale = 0.01;
	scene.add(this.body.mesh);
}

// helper funtion to run the flock
Boid.prototype.run = function (boids) {
	this.flock(boids);
	this.update();
	this.body.mesh.position.x = this.position.x;
	this.body.mesh.position.y = this.position.y;
	this.body.mesh.position.z = this.position.z;
};

function rrand(min, max) {
	return Math.random() * (max - min) + min;
}

// here we add all the forces
Boid.prototype.flock = function (boids) {
	var sep = this.separate(boids); // Separation
	var ali = this.align(boids); // Alignment
	var coh = this.cohesion(boids); // Cohesion
	var hom = this.steer(this.home);
	// Arbitrarily weight these forces
	sep.multiplyScalar(this.sepScale);
	ali.multiplyScalar(this.aliScale);
	coh.multiplyScalar(this.sepScale);
	hom.multiplyScalar(this.homScale);
	//
	this.acceleration
		.add(sep)
		.add(ali)
		.add(coh)
		.add(hom)
		.add(new THREE.Vector3(rrand(-0.01, 0.01), rrand(-0.01, 0.01), rrand(-0.01, 0.01)))
		.divideScalar(this.mass);
};
// update the position
Boid.prototype.update = function () {
	// Update velocity
	this.velocity.add(this.acceleration);
	//.limit(this.maxspeed);
	// update position
	this.position.add(this.velocity);
	// Reset accelertion to 0 each cycle
	this.acceleration.multiplyScalar(0);
};

// steer away from nearby boids
Boid.prototype.separate = function (boids) {
	var desiredSperation = 100; // how close is too close
	var sum = new THREE.Vector3(0, 0, 0); // accumulate nearby
	var boid;
	var count = 0;
	for (var i = 0; i < boids.length; i++) {
		boid = boids[i];
		var d = this.position.distanceTo(boid.position);
		if (d > 0 && d < desiredSperation) {
			var away = new THREE.Vector3()
				.subVectors(this.position, boid.position) // a vector pointing away
				.normalize() // get unit vector
				.divideScalar(d); // divide by distance
			sum.add(away); // add to our accumulator
			count++;
		}
	}
	if (count > 0) {
		sum.divideScalar(count);
	}
	return sum;
};
// go with the flow of the flock
Boid.prototype.align = function (boids) {
	var neighbor = 200; // how close is not close enough
	var sum = new THREE.Vector3(); // accumulate nearby
	var boid;
	var count = 0;
	for (var i = 0; i < boids.length; i++) {
		boid = boids[i];
		var d = this.position.distanceTo(boid.position);
		if (d > 0 && d < neighbor) {
			sum.add(boid.velocity); // add to our accumulator
			count++;
		}
	}
	if (count > 0) {
		sum.divideScalar(count);
		sum.limit(this.maxforce);
	}
	return sum;
};
// For the average location of all nearby boids,
// calculate steering vector towards that location
Boid.prototype.cohesion = function (boids) {
	var neighbour = 200; // how close is not close enough
	var sum = new THREE.Vector3(); // accumulate nearby
	var boid;
	var count = 0;
	for (var i = 0; i < boids.length; i++) {
		boid = boids[i];
		var d = this.position.distanceTo(boid.position);
		if (d > 0 && d < neighbour) {
			sum.add(boid.position); // add to our accumulator
			count++;
		}
	}
	if (count > 0) {
		sum.divideScalar(count);
		return this.steer(sum); // Steer towards the location
	}
	return sum;
};
// A method that calculates a steering vector towards a target
// second argument is if to slow down on approach
Boid.prototype.steer = function (target) {
	var steer = new THREE.Vector3(); // the steering vector
	var desired = new THREE.Vector3()
		.subVectors(target, this.position); // a vector pointing toward target
	var d = desired.length();
	if (d > 0) {
		desired.normalize()
			.multiplyScalar(this.maxspeed);
		steer.subVectors(desired, this.velocity);
	}
	return steer;
};

THREE.Vector3.prototype.limit = function(max) {
			if (this.length() > max) {
				this.normalize();
				this.multiplyScalar(max);
			}
		}
