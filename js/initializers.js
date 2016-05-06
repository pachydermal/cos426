/*
 * In this file you can specify all sort of initializers
 *  We provide an example of simple initializer that generates points withing a cube.
 */


function VoidInitializer ( opts ) {
    this._opts = opts;
    return this;
};

VoidInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

};


////////////////////////////////////////////////////////////////////////////////
// Basic Initializer
////////////////////////////////////////////////////////////////////////////////

function FriendInitializer ( opts ) {
    this._opts = opts;
    return this;
};

FriendInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];

        // SET TO INITIAL TARGET POSITION
        var pos = (new THREE.Vector3()).copy(base_pos);

        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
}

FriendInitializer.prototype.initializeVelocities = function ( velocities, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var vel = new THREE.Vector3(0,0,0);

        // ----------- STUDENT CODE END ------------
        setElement( idx, velocities, vel );
    }
    velocities.needUpdate = true;
}

FriendInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
    var base_col = this._opts.color;
    var pixel_var = 1.0;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var r = Math.min(Math.max(0.0,base_col.x + pixel_var*(Math.random()-0.5)),1.0);
        var g = Math.min(Math.max(0.0,base_col.y + pixel_var*(Math.random()-0.5)),1.0);
        var b = Math.min(Math.max(0.0,base_col.z + pixel_var*(Math.random()-0.5)),1.0);

        var new_col = new THREE.Vector4(r,g,b,1);

        // ----------- STUDENT CODE END ------------

        setElement( idx, colors, base_col );
    }
    colors.needUpdate = true;
}

FriendInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var siz_scal = 10;
        setElement( idx, sizes, this._opts.size + Math.max(0,Math.floor((Math.random() - 0.5)*siz_scal)));

        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
}

FriendInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];

        var lifetime = this._opts.lifetime;

        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
}

// how to make this funciton nicer to work with. This one is kinda ok, as for initialization
// everything is independent
FriendInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};
