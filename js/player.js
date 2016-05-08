var Player = Player || {};

Player.init = function() {
	var rand = Math.random() * 0.1 - 0.05;
	Player.position = [0,10,149]; // JENNIE: being higher up wastes less space on bottom
	Player.orientation = [0,rand,0];
	Player.holdingItem = false;
}

// Update the player's position
// THIS NEEDS TO BE FILLED IN. Right now it just increments.
Player.updatePosition = function() {

	this.position[0] += 0;
	this.position[1] += 0;
	this.position[2] += 0;
}

Player.pickUpItem = function() {
	// THIS NEEDS TO BE FILLED IN (MAYBE)

	// Pick up item (this part might not belong in this class, but just generally in the rendering class)

	this.holdingItem = true;
}

Player.putDownItem = function() {
	// THIS ALSO NEEDS TO BE FILLED IN (MAYBE)

	this.holdingItem = false;
}

Player.moveForward = function(amount) {
	if (amount == 0) return;

	var a = new THREE.Euler( Player.orientation[0], Player.orientation[1], Player.orientation[2], 'XYZ' );
	var b = new THREE.Vector3(0,0,-1);
	b.applyEuler(a);

	var newPosition = [];
	newPosition[0] = this.position[0] + amount*b.x;
	newPosition[1] = this.position[1] + amount*b.y;
	newPosition[2] = this.position[2] + amount*b.z;

	if (Game.inBounds(newPosition) && Game.noWall(this.position, newPosition)) { // check if in bounds
		// actually move since in bounds
		this.position[0] = newPosition[0];
		this.position[1] = newPosition[1];
		this.position[2] = newPosition[2];

		Renderer._camera.position.set(this.position[0],this.position[1],this.position[2]);
	}
	else {
		this.moveForward(amount - 1);
	}
}

Player.moveBackward = function(amount) {
	if (amount == 0) return;

	var a = new THREE.Euler( Player.orientation[0], Player.orientation[1], Player.orientation[2], 'XYZ' );
	var b = new THREE.Vector3(0,0,1);
	b.applyEuler(a); 

	var newPosition = [];
	newPosition[0] = this.position[0] + amount*b.x;
	newPosition[1] = this.position[1] + amount*b.y;
	newPosition[2] = this.position[2] + amount*b.z;

	if (Game.inBounds(newPosition) && Game.noWall(this.position, newPosition)) { // check if in bounds
		// actually move since in bounds
		this.position[0] = newPosition[0];
		this.position[1] = newPosition[1];
		this.position[2] = newPosition[2];

		Renderer._camera.position.set(this.position[0],this.position[1],this.position[2]);
	}
	else {
		this.moveBackward(amount - 1);
	}
}

Player.turnLeft = function(amount) {
	// var a = new THREE.Euler( Player.orientation[0], Player.orientation[1], Player.orientation[2], 'XYZ' );
	// var b = Renderer._camera.up.clone();
	// b.applyEuler(a); // rotate the initial up vector 

	Player.orientation[1] += amount;
	Renderer._camera.rotation.set( Player.orientation[0], Player.orientation[1], Player.orientation[2]); 
}

Player.turnRight = function(amount) {
	Player.orientation[1] -= amount;
	Renderer._camera.rotation.set( Player.orientation[0], Player.orientation[1], Player.orientation[2]); 
}