var Game = Game || {};

Game.init = function() {
	Game.level = 0; // current level
	Game.storylinePage = 0; // page in the storyline for the current level
	Game.playingMode = false; // if false, means not playing just scrolling through story/instructions
					 	  	  // if true, mean's we're in playing mode
	Game.numLevels = 4; // number of levels

	this.openStoryline(); // open the storyline on the web page 
}


// Move onto the next level. If finished all levels, won the game!
Game.progressToNextLevel = function() {
	this.level += 1;
	this.playingMode = false;

	if (this.level < this.numLevels) {
		this.storylinePage = 0;
		this.openStoryline();
	}
	else {
		this.wonGame();
	}
}

// Based on timer 
// THIS NEEDS TO BE MODIFIED
Game.timesUp = function() {
	if (Math.random() < 0.0000001) return true;
	else return false;
}

// What defines the completion of a level? Returns true if the level has been completed, false otherwise. 
// THIS NEEDS TO BE FILLED IN
Game.levelCompleted = function() {
	var bounds = 10;
	
	if (Player.position[0] <= Goal.position[0] + bounds && Player.position[0] >= Goal.position[0] - bounds) {
		if (Player.position[1] <= Goal.position[1] + bounds && Player.position[1] >= Goal.position[1] - bounds) {
			if (Player.position[2] <= Goal.position[2] + bounds && Player.position[2] >= Goal.position[2] - bounds) {
				return true;
			}
		}
	}
	return false;
}

// Checks if given position is within bounds, bounds are INCLUSIVE
// NEEDS TO BE FILLED IN
Game.inBounds = function( position ) {
	var xMin = -301;
	var xMax = 301;
	var yMin = -301;
	var yMax = 301;
	var zMin = -301;
	var zMax = 301;

	if (position[0] <= xMax && position[0] >= xMin) { // check x values
		if (position[1] <= yMax && position[1] >= yMin) { // check y values
			if (position[2] <= zMax && position[2] >= zMin) { // check z values
				return true;
			}
		}
	}
	return false;
}

// Checks that given newPosition is not hitting any walls formed
Game.noWall = function( position, newPosition ) {
	if (this.level == 0) {
		for (var i  = 0; i < SystemSettings.level0.walls.length; i++) {
			SystemSettings.level0.walls[i].geometry.computeBoundingBox();
			var bBox = SystemSettings.level0.walls[i].geometry.boundingBox.clone();
			var boxPos = SystemSettings.level0.walls[i].position.clone();

			// moving to correct position
			bBox.min.x = bBox.min.x + boxPos.x;
			bBox.max.x = bBox.max.x + boxPos.x;

			bBox.min.z = bBox.min.z + boxPos.z;
			bBox.max.z = bBox.max.z + boxPos.z;

			// fix y because don't care about
			bBox.min.y = position[1];
			bBox.max.y = position[1];

			var origin = new THREE.Vector3(position[0], position[1], position[2]);
			var dest = new THREE.Vector3(newPosition[0], newPosition[1], newPosition[2]);
			var dir = new THREE.Vector3().subVectors(dest, origin);
			var ray = new THREE.Ray(origin, dir);

			var intersect = ray.intersectBox(bBox);

			if (intersect !== null) {
				if (origin.distanceTo(intersect) > 0) {
					// but the intersection point must be closer than the walk distance
					if (origin.distanceTo(dest) > origin.distanceTo(intersect)) {
						
						return false;
					}
				}
			}
		}
	}
	else if (this.level == 1) {
		for (var i  = 0; i < SystemSettings.level1.walls.length; i++) {
			SystemSettings.level1.walls[i].geometry.computeBoundingBox();
			var bBox = SystemSettings.level1.walls[i].geometry.boundingBox.clone();
			var boxPos = SystemSettings.level1.walls[i].position.clone();

			// moving to correct position
			bBox.min.x = bBox.min.x + boxPos.x;
			bBox.max.x = bBox.max.x + boxPos.x;

			bBox.min.z = bBox.min.z + boxPos.z;
			bBox.max.z = bBox.max.z + boxPos.z;

			// fix y because don't care about
			bBox.min.y = position[1];
			bBox.max.y = position[1];

			var origin = new THREE.Vector3(position[0], position[1], position[2]);
			var dest = new THREE.Vector3(newPosition[0], newPosition[1], newPosition[2]);
			var dir = new THREE.Vector3().subVectors(dest, origin);
			var ray = new THREE.Ray(origin, dir);

			var intersect = ray.intersectBox(bBox);

			if (intersect !== null) {
				if (origin.distanceTo(intersect) > 0) {
					// but the intersection point must be closer than the walk distance
					if (origin.distanceTo(dest) > origin.distanceTo(intersect)) {
						return false;
					}
				}
			}
		}
	}
	else if (this.level == 2) {
		for (var i  = 0; i < SystemSettings.level2.walls.length; i++) {
			SystemSettings.level2.walls[i].geometry.computeBoundingBox();
			var bBox = SystemSettings.level2.walls[i].geometry.boundingBox.clone();
			var boxPos = SystemSettings.level2.walls[i].position.clone();

			// moving to correct position
			bBox.min.x = bBox.min.x + boxPos.x;
			bBox.max.x = bBox.max.x + boxPos.x;

			bBox.min.z = bBox.min.z + boxPos.z;
			bBox.max.z = bBox.max.z + boxPos.z;

			// fix y because don't care about
			bBox.min.y = position[1];
			bBox.max.y = position[1];

			var origin = new THREE.Vector3(position[0], position[1], position[2]);
			var dest = new THREE.Vector3(newPosition[0], newPosition[1], newPosition[2]);
			var dir = new THREE.Vector3().subVectors(dest, origin);
			var ray = new THREE.Ray(origin, dir);

			var intersect = ray.intersectBox(bBox);

			if (intersect !== null) {
				if (origin.distanceTo(intersect) > 0) {
					// but the intersection point must be closer than the walk distance
					if (origin.distanceTo(dest) > origin.distanceTo(intersect)) {
						return false;
					}
				}
			}
		}
	}
	else if (this.level == 3) {
		for (var i  = 0; i < SystemSettings.level3.walls.length; i++) {
			SystemSettings.level3.walls[i].geometry.computeBoundingBox();
			var bBox = SystemSettings.level3.walls[i].geometry.boundingBox.clone();
			var boxPos = SystemSettings.level3.walls[i].position.clone();

			// moving to correct position
			bBox.min.x = bBox.min.x + boxPos.x;
			bBox.max.x = bBox.max.x + boxPos.x;

			bBox.min.z = bBox.min.z + boxPos.z;
			bBox.max.z = bBox.max.z + boxPos.z;

			// fix y because don't care about
			bBox.min.y = position[1];
			bBox.max.y = position[1];

			var origin = new THREE.Vector3(position[0], position[1], position[2]);
			var dest = new THREE.Vector3(newPosition[0], newPosition[1], newPosition[2]);
			var dir = new THREE.Vector3().subVectors(dest, origin);
			var ray = new THREE.Ray(origin, dir);

			var intersect = ray.intersectBox(bBox);

			if (intersect !== null) {
				if (origin.distanceTo(intersect) > 0) {
					// but the intersection point must be closer than the walk distance
					if (origin.distanceTo(dest) > origin.distanceTo(intersect)) {
						return false;
					}
				}
			}
		}
	}
	return true;
}

// Close the game space and reopen the storyline pages (if we follow the convention
// I used for naming the pages, this doesn't need to be changed)
Game.openStoryline = function() {
	document.getElementById("storypage").style.display = "block";
	document.getElementById("storypage").style.height = window.innerHeight + "px";
    document.getElementById("storypage").style.width = window.innerWidth + "px";
    document.getElementById("storypage").style.backgroundColor = "red";
    document.getElementById("gamediv").style.display = "none";
	document.getElementById("storyline" + this.level + "-" + this.storylinePage).style.display = "block";
}

// Go the level given 
// will need to be changed when we finish writing our levels
Game.goToLevel = function(level) {
	if (level == 0) {
		var nextLevel = SystemSettings.level0;
	}
	else if (level == 1) {
		var nextLevel = SystemSettings.level1;
	}
	else if (level == 2) {
		var nextLevel = SystemSettings.level2;
	}
	else if (level == 3) {
		var nextLevel = SystemSettings.level3;
	}
	else {
		var nextLevel = SystemSettings.level0;
	}

	Main.particleSystemChangeCallback( nextLevel)
	Player.init();
	Goal.init(this.level);
}

// Get the next storyline page based on the current level and storyline (if we follow the convention
// I used for naming the pages, this doesn't need to be changed)
Game.nextPage = function() {
	document.getElementById("storyline" + this.level + "-" + this.storylinePage).style.display = "none";
	Game.storylinePage += 1;
	document.getElementById("storyline" + this.level + "-" + this.storylinePage).style.display = "block";
}

// Close storyline and play the game! (Based on which level we're currently on)
Game.playGame = function () {
	document.getElementById("storyline" + this.level + "-" + this.storylinePage).style.display = "none";
	document.getElementById("storypage").style.display = "none";

	document.getElementById("gamediv").style.display = "block";

	// Add particle system
	Game.goToLevel(this.level);

    // Main.particleSystemChangeCallback( SystemSettings.fountainBounce );
    Renderer.create( Scene, document.getElementById("canvas") );

    // SARAH
    Renderer.update();
    document.getElementById("topbar").style.height = window.innerHeight*0.23 + "px"; // SARAH
    document.getElementById("topbar").style.backgroundColor = "red"; 
    this.playingMode = true;
}

// Close game and bring up page for winning the game
Game.wonGame = function() {
	document.getElementById("storypage").style.display = "block";
	document.getElementById("storypage").style.height = window.innerHeight + "px";
    document.getElementById("storypage").style.width = window.innerWidth + "px";
    document.getElementById("storypage").style.backgroundColor = "red";
    document.getElementById("gamediv").style.display = "none";
	document.getElementById("youwon").style.display = "block";
}

// Bring up page for losing the game
Game.lostGame = function() {
	document.getElementById("storypage").style.display = "block";
	document.getElementById("storypage").style.height = window.innerHeight + "px";
    document.getElementById("storypage").style.width = window.innerWidth + "px";
    document.getElementById("storypage").style.backgroundColor = "red";
    document.getElementById("gamediv").style.display = "none";
	document.getElementById("youlost").style.display = "block";
}