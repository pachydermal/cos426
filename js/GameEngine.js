////////////////////////////////////////////////////////////////////////////////
// COS 426 Assignement 4 stub                                                 //
// Particle Systems                                                           //
// Many ideas here are taken from SPARKS.js                                   //
////////////////////////////////////////////////////////////////////////////////

// TODO :
// - shader requires more exploration / better interface
// - change moving particle to setting it invisible in shader
// - initializers and particle engine must work with all the sahder supported attributes
// - incorporate gui controls

// Singleton Engine - we will have one particle engine per application,
// driving the entire application.
var GameEngine = GameEngine || new ( function() {
    var _self      = this;

    // Instance variables - list of emitters, and global delta time
    _self._objects   = [];
    _self._animations = [];
    _self._meshes     = [];
    _self._prev_t     = undefined;
    _self._cur_t      = undefined;
    _self._isRunning  = false;

    _self.addObject = function ( object ) {
        _self._objects.push( object );
    };

    _self.removeObjects = function() {
        _self._objects = [];
    };

    _self.addMesh = function ( mesh ) {
        _self._meshes.push( mesh );
    };

    _self.removeMeshes = function() {
        _self._meshes = [];
    };

    _self.addAnimation = function ( animation ) {
        _self._animations.push( animation );
        animation.play()
    };

    _self.removeAnimations = function () {
        for ( var i = 0 ; i < _self._animations.length; ++i ) {
            _self._animations[i].isPlaying = false;
        }
        _self._animations = [];
    };

    _self.start = function () {
        _self._prev_t = Date.now();
        _self._cur_t  = Date.now();
        _self._isRunning = true;
    };

    _self.step = function () {
        // deal with time
        _self._cur_t  = Date.now();
        var elapsed  = (_self._cur_t - _self._prev_t) / 1000.0;
        _self._prev_t = _self._cur_t;
        if ( !_self._isRunning ) elapsed = 0.0;

        for ( var i = 0; i < _self._animations.length ; ++i ) {
            _self._animations[i].update( elapsed * 1000.0 );
        }

        for ( var i = 0 ; i < _self._objects.length ; ++i ) {
            _self._objects[i].update( elapsed );
        }

    };

    _self.stop = function () {
        _self._isRunning = false;
    },

    _self.pause = function () {
        if ( _self._isRunning ) {
            _self.stop();
        } else {
            _self.start();
        }
    };

    _self.restart = function () {
        _self.stop();
        for ( var i = 0 ; i < _self._objects.length ; ++i ) {
            _self._objects[i].restart();
        }
        _self.start();
    };

    _self.getDrawableObjects = function ( object_idx ) {
        return _self._objects[object_idx].getDrawableObjects();
    }

    _self.getObjects = function( ) {
        return _self._objects;
    }

    return _self;
})();

// function Target ( opts ) {

//     // console.log ( "Emiiter", this );
//     // initialize some base variables needed by emitter, that we will extract from options
//     this._initializer          = undefined;
//     this._updater              = undefined;
//     this._width                = undefined;
//     this._height               = undefined;
//     this._model                = undefined; // which object file we're using (e.g. key or person)
//     this._attributeInformation = {
//         position:      3,
//         velocity:      3,
//         color:         4,
//         size:          1,
//         lifetime:      1e20,
//     };
//     this._updatedAttributeInformation = {};

//     // parse options
//     for ( var option in opts ) {
//         var value = opts[option];
//         if ( option === "material" ) {
//             this._material = value;
//         } else if ( option === "initialize" ) {
//             this._initializer = value;
//         } else if ( option === "update" ) {
//             this._updater = value;
//         } else if ( option === "material" ) {
//             this._material = value;
//         } else if ( option === "width" ) {
//             this._width = value;
//         } else if ( option === "height" ) {
//             this._height = value;
//         } else {
//             console.log( "Unknown option " + option + "! Make sure to register it!" )
//         }
//     }

//     // These are more internal variables that will be initialized based on parsed arguments.
//     // For example, attributes given to THREE.BufferGeometry will depend on attributeInformation
//     // variable.

//     // this._object          = new THREE.BufferGeometry();
//     this._initialized        = false;

//     // Store indices of available particles - these are not initialized yet
//     // for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
//     //     this._initialized[i] = false;
//     // }

//     // Allocate memory for the particles
//     // for ( var attributeKey in this._attributeInformation ) {
//     //     // get info from attributeInformation, required to initialize correctly sized arrays
//     //     var attributeLength = this._attributeInformation[ attributeKey ];
//     //     var attributeArray = new Float32Array( this._maxParticleCount * attributeLength );

//     //     // // Since these are zero - initialized, they will appear in the scene.
//     //     // // By setting all to be negative infinity we will effectively remove these from rendering.
//     //     // // This is also how you "remove" dead particles
//     //     // for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
//     //     //     for ( var j = 0 ; j < attributeLength ; ++j ) {
//     //     //         attributeArray[ attributeLength * i + j ] = 1e-9;
//     //     //     }
//     //     // }

//     //     this._particles.addAttribute( attributeKey, new THREE.BufferAttribute( attributeArray, attributeLength ) );
//     // }

//     // this._particleAttributes = this._particles.attributes; // for convenience / less writing / not sure / #badprogramming

//     // this._sorting = false;
//     // this._distances = [];
//     // this._backupArray = new Float32Array( this._maxParticleCount * 4 );

    
//     // this._drawableObjects = new THREE.PointCloud( this._particles, this._material );

//     for ( var attributeKey in this._attributeInformation ) {
//         this._updatedAttributeInformation[attributeKey] = this._attributeInformation[attributeKey]
//     }

//     return this;
// };

// Target.prototype.restart = function() {

//     this._initialized = false;

//     for ( var attributeKey in this._updatedAttributeInformation ) {
//         this._updatedAttributeInformation[attributeKey] = this._attributeInformation[attributeKey];
//         this._updatedAttributeInformation[attributeKey].needsUpdate = true;
//     }
// }

// Target.prototype.update = function( delta_t ) {

//     // add check for existence
//     this._updater.update( this._updatedAttributeInformation, this._initialized, delta_t, this._width, this._height );

//     // for visibility culling
//     // this._drawableObjects.geometry.computeBoundingSphere(); // ???
// }


// Target.prototype.enableSorting = function( val ) {
//     this._sorting = val;
// };

// Target.prototype.getDrawableObjects = function () {
//     return this;
// };

// // Target.prototype.getSpawnable = function ( toAdd ) {
// //     var toSpawn = [];
// //     for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {

// //         if ( this._initialized[i] ) continue;
// //         if ( toSpawn.length >= toAdd ) break;
// //         this._initialized[i] = true;
// //         toSpawn.push(i);

// //     }

// //     return toSpawn;
// // };






function Emitter ( opts ) {
    // console.log ( "Emiiter", this );
    // initialize some base variables needed by emitter, that we will extract from options
    this._initializer          = undefined;
    this._numObjects           = undefined;
    this._updater              = undefined;
    this._width                = undefined;
    this._height               = undefined;
    this._attributeInformation = {
        position:      3,
        velocity:      3,
        color:         4,
        size:          1,
        lifetime:      100,
    };

    // parse options
    for ( var option in opts ) {
        var value = opts[option];
        if ( option === "material" ) {
            this._material = value;
        } else if ( option === "initialize" ) {
            this._initializer = value;
        } else if ( option === "numObjects" ) {
            this._numObjects = value;
        } else if ( option === "update" ) {
            this._updater = value;
        } else if ( option === "material" ) {
            this._material = value;
        } else if ( option === "width" ) {
            this._width = value;
        } else if ( option === "height" ) {
            this._height = value;
        } else {
            console.log( "Unknown option " + option + "! Make sure to register it!" )
        }
    }

    // These are more internal variables that will be initialized based on parsed arguments.
    // For example, attributes given to THREE.BufferGeometry will depend on attributeInformation
    // variable.
    this._objects            = new THREE.BufferGeometry();
    this._initialized        = [];

    // Store indices of available particles - these are not initialized yet
    for ( var i = 0 ; i < this._numObjects ; ++i ) {
        this._initialized[i] = false;
    }

    // Allocate memory for the particles
    for ( var attributeKey in this._attributeInformation ) {
        // get info from attributeInformation, required to initialize correctly sized arrays
        // console.log(this._attributeInformation);
        
        var attributeLength = this._attributeInformation[ attributeKey ];
        var attributeArray = new Float32Array( this._numObjects * attributeLength );

        // Since these are zero - initialized, they will appear in the scene.
        // By setting all to be negative infinity we will effectively remove these from rendering.
        // This is also how you "remove" dead particles
        for ( var i = 0 ; i < this._numObjects ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = 1e-9;
            }
        }

        this._objects.addAttribute( attributeKey, new THREE.BufferAttribute( attributeArray, attributeLength ) );
    }

    this._objectAttributes = this._objects.attributes; // for convenience / less writing / not sure / #badprogramming

    this._sorting = false;
    this._distances = [];
    this._backupArray = new Float32Array( this._numObjects * 4 );

    // Create the drawable particles - this is the object that three.js will use to draw stuff onto screen
    this._drawableObjects = new THREE.Points( this._objects, this._material );

    return this;
};

Emitter.prototype.restart = function() {

    for ( var i = 0 ; i < this._numObjects ; ++i ) {

        this._initialized[i] = 0;

    }

    for ( var attributeKey in this._objectAttributes ) {

        var attribute       = this._objectAttributes[attributeKey];
        var attributeArray  = attribute.array;
        var attributeLength = attribute.itemSize;

        for ( var i = 0 ; i < this._numObjects ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = 1e-9;
            }
        }

        attribute.needsUpdate = true;
    }
}

Emitter.prototype.update = function( delta_t ) {
    // how many particles should we add?
    // var toAdd = Math.floor( delta_t * this._particlesPerSecond );
    var toAdd = 1;

    if ( toAdd > 0 ) {
        this._initializer.initialize ( this._objectAttributes, this.getSpawnable( toAdd ), this._width, this._height );
    }

    // add check for existence
    this._updater.update( this._objectAttributes, this._initialized, delta_t, this._width, this._height );

    // sorting -> Move it to camera update / loop update so that it is updated each time even if time is paused?
    if ( this._sorting === true ) {
        this.sortObjects();
    }

    // for visibility culling
    this._drawableObjects.geometry.computeBoundingSphere();
}


Emitter.prototype.enableSorting = function( val ) {
    this._sorting = val;
};

Emitter.prototype.getDrawableObjects = function () {
    return this._drawableObjects;
};

Emitter.prototype.sortObjects = function () { // STOPEED HERE
    var positions  = this._objectAttributes.position;
    var cameraPosition = Renderer._camera.position;

    for ( var i = 0 ; i < this._numObjects ; ++i ) {
        var currentPosition =  getElement( i, positions );
        this._distances[i] = [cameraPosition.distanceToSquared( currentPosition ),i];
    }

    this._distances.sort( function( a, b ) { return a[0] < b[0] } );

    for ( var attributeKey in this._objectAttributes ) {

        var attributeLength = this._objectAttributes[ attributeKey ].itemSize;
        var attributeArray  = this._objectAttributes[ attributeKey ].array;

        for ( var i = 0 ; i < this._numObjects ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                this._backupArray[4 * i + j ] = attributeArray[ attributeLength * this._distances[i][1] + j ]
            }
        }

        for ( var i = 0 ; i < this._numObjects ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = this._backupArray[4 * i + j ];
            }
        }
    }

    initialized_cpy = []
    for ( var i = 0 ; i < this._numObjects ; ++i ) {
        initialized_cpy[ i ] = this._initialized[ this._distances[i][1] ];
    }

    for ( var i = 0 ; i < this._numObjects ; ++i ) {
        this._initialized[ i ] = initialized_cpy[i];
    }
};

Emitter.prototype.getSpawnable = function ( toAdd ) {
    var toSpawn = [];
    for ( var i = 0 ; i < this._numObjects ; ++i ) {

        if ( this._initialized[i] ) continue;
        if ( toSpawn.length >= toAdd ) break;
        this._initialized[i] = true;
        toSpawn.push(i);

    }

    return toSpawn;
};


