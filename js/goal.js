var Goal = Goal || {};

Goal.init = function(level) {
	// FILL IN FOR EVERY LEVEL
	if (level == 0) {
		this.position = [220,10,-70];
	}
	else if (level == 1 || level == 2) { 
		// JENNIE: also storing locations of officers
		// because I don't know where else to store right now...
		// officer 0: [-170, 10, 140]
		// officer 1: [-80, 10, -110]
		// officer 2: [-30, 10, -110]
		// officer 3: [170, 10, -110]
		// officer 4: [180, 10, 40]
		// officer 5: [180, 10, 140] RIGHT NOW IS GOAL

		this.position = [180, 10, 140];
	}
	else if (level == 3) {
		// JENNIE: just wins if gets to printer right now
		this.position = [-280, 10, 0];
	}
	else {
		this.position = [400,400,400];
	}
}

// Update the goal's position
// THIS NEEDS TO BE FILLED IN. Right now it just stays the same.
Goal.updatePosition = function(level) {
	// FILL IN FOR EVERY LEVEL
	if (level == 0) {
		this.position[0] += 0;
		this.position[1] += 0;
		this.position[2] += 0;
	}
	else {
		this.position[0] += 0;
		this.position[1] += 0;
		this.position[2] += 0;
	}
}
