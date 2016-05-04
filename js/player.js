var Player = Player || {};

Player.init = function() {
	Player.position = [0,0,0];
	Player.holdingItem = false;
}

// Update the player's position
// THIS NEEDS TO BE FILLED IN. Right now it just increments.
Player.updatePosition = function() {

	this.position[0] += 1;
	this.position[1] += 1;
	this.position[2] += 1;
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