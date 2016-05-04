var Game = Game || {};

Game.init = function() {
	Game.level = 0; // current level
	Game.storylinePage = 0; // page in the storyline for the current level
	Game.playingMode = false; // if false, means not playing just scrolling through story/instructions
					 	  	  // if true, mean's we're in playing mode
	Game.numLevels = 2; // number of levels

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
	if (Math.random() < 0.001) return true;
	else return false;
}

// What defines the completion of a level? Returns true if the level has been completed, false otherwise. 
// THIS NEEDS TO BE FILLED IN
Game.levelCompleted = function() {
	
	if (Player.position[0] == Goal.position[0] && Player.position[1] == Goal.position[1] && Player.position[2] == Goal.position[2]) {
		return true;
	}
	else return false;
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
		var nextLevel = SystemSettings.cloth;
	}
	else {
		var nextLevel = SystemSettings.animated;
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