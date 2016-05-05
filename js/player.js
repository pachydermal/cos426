var Player = Player || {};

Player.init = function() {
	Player.position = [0,0,200];
	Player.orientation = [0,0,0];
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
	var a = new THREE.Euler( Player.orientation[0], Player.orientation[1], Player.orientation[2], 'XYZ' );
	var b = new THREE.Vector3(0,0,-1);
	b.applyEuler(a); 

	this.position[0] += amount*b.x;
	this.position[1] += amount*b.y;
	this.position[2] += amount*b.z;
	Renderer._camera.position.set(this.position[0],this.position[1],this.position[2]);
}

Player.moveBackward = function(amount) {
	var a = new THREE.Euler( Player.orientation[0], Player.orientation[1], Player.orientation[2], 'XYZ' );
	var b = new THREE.Vector3(0,0,1);
	b.applyEuler(a); 

	this.position[0] += amount*b.x;
	this.position[1] += amount*b.y;
	this.position[2] += amount*b.z;
	Renderer._camera.position.set(this.position[0],this.position[1],this.position[2]);
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