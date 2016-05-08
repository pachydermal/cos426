// DELETED BATCH.JS (SARAH)

var Main = Main || { };

// when HTML is finished loading, do this
window.onload = function() {

    // Begin the game from level 0 (SARAH)
    Player.init(); // we create a player
    Game.init(); // and setup the game
    Scene.create(); // then we create a scene

    // The player must read the storyline, each button taking it to the next page. Eventually, one of the 
    // buttons starts the game. See Game.playGame().


    // add event listener that will cause 'I' key to download image
    window.addEventListener( 'keydown', function( event ) {
        var moveInc = 10;
        var turnInc = 0.05;

        if (event.which == 38) { // move forward
            Player.moveForward(moveInc);  
        }else if (event.which == 40) { // move backwards
            Player.moveBackward(moveInc); 
        }else if (event.which == 37) { // left turn
            Player.turnLeft(turnInc);
        }else if (event.which == 39) { // right turn
            Player.turnRight(turnInc);
        }
    });

};

// We use this to present the new levels of the game, which are interactive and involve animation. 
// called when the gui params change and we need to update mesh
Main.particleSystemChangeCallback = function ( InputSettings ) {

    // Get rid of an old system
    GameEngine.stop(); // WE CHANGED THIS
    for ( var i = 0 ; i < GameEngine._objects.length ; ++i ) {
        Scene.removeObject( GameEngine.getDrawableObjects( i ) );
    }
    GameEngine.removeObjects();
    GameEngine.removeAnimations();

    // Get rid of old models
    Scene.removeObjects();

    // If we specified animated model, then lets load it first, THIS STAYS THE SAME
    if ( InputSettings.animatedModelName ) {
        var loader = new THREE.JSONLoader( true );
        loader.load( InputSettings.animatedModelName, InputSettings.animationLoadFunction );
    }

    // Create new system
    var initializer = new InputSettings.initializerFunction ( InputSettings.initializerSettings ); // STAYS THE SAME

    var updater     = new InputSettings.updaterFunction ( InputSettings.updaterSettings ); // STAYS THE SAME

    var emitter     = new Emitter ( { // WE CHANGED THIS
        numObjects:    InputSettings.numObjects, 
        initialize:    initializer,                  // initializer object
        update:        updater,                      // updater object
        material:      InputSettings.particleMaterial,
        width:         InputSettings.width,
        height:        InputSettings.height,
    } );


    GameEngine.addObject ( emitter );

    // Add new particle system
    GameEngine.start();

    // Add the particle system
    for ( var i = 0 ; i < GameEngine._objects.length ; ++i ) {
        Scene.addObject( GameEngine.getDrawableObjects( i ) );
    }

    // Create the scene
    InputSettings.createScene();
};
