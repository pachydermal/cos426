var Goal = Goal || {};

Goal.init = function(level) {
	// FILL IN FOR EVERY LEVEL
	if (level == 0) {
		this.position = [220,10,-70];
	}
	else {
		this.position = [40000,400,400];
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
