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

function SphereInitializer ( opts ) {
    this._opts = opts;
    return this;
};

SphereInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        // for now we just generate a random point in the unit cube; needs to be fixed

        var u = Math.random()*2.0 - 1.0;
        var theta = Math.random()*2.0*Math.PI;
        var pos = new THREE.Vector3( r*Math.sqrt(1.0 - u*u)*Math.cos(theta),
                                     r*Math.sqrt(1.0 - u*u)*Math.sin(theta),
                                     r*u );
        pos.add(base_pos);

        // ----------- STUDENT CODE END ------------
        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
}

SphereInitializer.prototype.initializeVelocities = function ( velocities, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        // just to get started, make the velocity the same as the initial position

        var pos = getElement( idx, positions );
        var vel = pos.clone().multiplyScalar(10.0);

        // ----------- STUDENT CODE END ------------
        setElement( idx, velocities, vel );
    }
    velocities.needUpdate = true;
}

SphereInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
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
        setElement( idx, colors, new_col );
    }
    colors.needUpdate = true;
}

SphereInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        
        var siz_scal = 10;
        setElement( idx, sizes, this._opts.size + Math.max(0,Math.floor((Math.random() - 0.5)*siz_scal)));

        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
}

SphereInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var lifetime = this._opts.lifetime*(0.25 + 1.5*Math.random());

        // ----------- STUDENT CODE END ------------
        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
}

// how to make this funciton nicer to work with. This one is kinda ok, as for initialization
// everything is independent
SphereInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};



////////////////////////////////////////////////////////////////////////////////
// Basic Initializer
////////////////////////////////////////////////////////////////////////////////

function FountainInitializer ( opts ) {
    this._opts = opts;
    return this;
};

FountainInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        // Initial positions at the top of the base, within a square 1/4 of the 
        // area of the top square 
        var pos = (new THREE.Vector3()).copy(base_pos);
        pos.x = pos.x + (Math.random() - 0.5)*this._opts.size; 
        pos.z = pos.z + (Math.random() - 0.5)*this._opts.size;

        // ----------- STUDENT CODE END ------------
        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
}

FountainInitializer.prototype.initializeVelocities = function ( velocities, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var vel = base_vel.clone();
        var scal = 10.0;
        var rad = scal*Math.random();

        var theta = Math.random()*2*Math.PI;
        vel.add(new THREE.Vector3(rad*Math.cos(theta),1.5*scal,rad*Math.sin(theta)));

        // ----------- STUDENT CODE END ------------
        setElement( idx, velocities, vel );
    }
    velocities.needUpdate = true;
}

FountainInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
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

FountainInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var siz_scal = 10;
        setElement( idx, sizes, this._opts.size + Math.max(0,Math.floor((Math.random() - 0.5)*siz_scal)));

        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
}

FountainInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];

        var lifetime = this._opts.lifetime;

        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
}

// how to make this funciton nicer to work with. This one is kinda ok, as for initialization
// everything is independent
FountainInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};

////////////////////////////////////////////////////////////////////////////////
// Animation Initializer
////////////////////////////////////////////////////////////////////////////////

function AnimationInitializer ( opts ) {
    this._opts = opts;
    return this;
};

function getTriangleArea(p1,p2,p3,N) {
    var tmp1 = (new THREE.Vector3()).subVectors(p2,p1);
    var tmp2 = (new THREE.Vector3()).subVectors(p3,p1);
    tmp1.cross(tmp2);
    return 0.5*tmp1.dot(N);
}

// this function gets the morphed position of an animated mesh.
// we recommend that you do not look too closely in here ;-)
AnimationInitializer.prototype.getMorphedMesh = function () {

     if ( ParticleEngine._meshes[0] !== undefined  && ParticleEngine._animations[0] !== undefined){

        var mesh       = ParticleEngine._meshes[0];

        var vertices   = [];
        var n_vertices = mesh.geometry.vertices.length;

        var faces      = ParticleEngine._meshes[0].geometry.faces;

        var morphInfluences = ParticleEngine._meshes[0].morphTargetInfluences;
        var morphs          = ParticleEngine._meshes[0].geometry.morphTargets;

        if ( morphs === undefined ) {
            return undefined;
        }
        for ( var i = 0 ; i < morphs.length ; ++i ) {

            if ( morphInfluences[i] !== 0.0 ) {
                for ( var j = 0 ; j < n_vertices ; ++j ) {
                    vertices[j] = new THREE.Vector3( 0.0, 0.0, 0.0 );
                    vertices[j].add ( morphs[i].vertices[j] );
                }
            }
        }

        // Added attribute totalArea (summed area of all the faces)
        var totalArea = 0.0;
        for (var i = 0; i < faces.length; i++) {
            faces[i].area = getTriangleArea(vertices[faces[i].a],vertices[faces[i].b],vertices[faces[i].c],faces[i].normal);
            totalArea += faces[i].area;
        }

        return { vertices : vertices, faces : faces, scale: mesh.scale, position: mesh.position, totalArea: totalArea };

    } else {

        return undefined;

    }
}


AnimationInitializer.prototype.initializePositions = function ( positions, toSpawn, mesh ) {

    var base_pos = this._opts.position;
    var faces = mesh.faces;
    var vertices = mesh.vertices;

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        // ----------- STUDENT CODE BEGIN ------------

        // Randomly select face (each face weighted by its area)
        var areaTracker = 0.0;
        var randArea = Math.random()*mesh.totalArea; // total area of all faces
        var randFace = -1; 
        for (var j = 0; j < faces.length; j++) {
            if (areaTracker + faces[j].area >= randArea) {
                randFace = j;
                break; // randomly selected face randFace
            }
            areaTracker += faces[j].area;
        }

        // Extract vertices of face
        var face = faces[randFace];
        var v1 = vertices[face.a].clone().multiply(mesh.scale);
        var v2 = vertices[face.b].clone().multiply(mesh.scale);
        var v3 = vertices[face.c].clone().multiply(mesh.scale);


        // Uniformly select a point inside the face using barycentric coordinates
        var p = v1.clone();
        var alpha = Math.random();
        var beta = Math.random();
        while (beta + alpha > 1.0) {
            alpha = Math.random();
            beta = Math.random();
        }
        p.add((new THREE.Vector3()).subVectors(v2,v1).multiplyScalar(alpha));
        p.add((new THREE.Vector3()).subVectors(v3,v1).multiplyScalar(beta));

        setElement( i, positions, p );

        // ----------- STUDENT CODE END ------------

    }
    positions.needUpdate = true;
}

AnimationInitializer.prototype.initializeVelocities = function ( velocities, toSpawn) {

    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var scal = 20;
        var vel = base_vel.clone();
        vel.sub(new THREE.Vector3(scal*(Math.random() - 0.5),scal*(Math.random() - 0.5),scal*(Math.random() - 0.5)));

        setElement( idx, velocities, vel );

        // ----------- STUDENT CODE END ------------
    }
    velocities.needUpdate = true;
}

AnimationInitializer.prototype.initializeColors = function ( colors, toSpawn) {

    var base_col = this._opts.color;
    var pixel_var = 1.0;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var r = Math.min(Math.max(0.0,base_col.x + pixel_var*(Math.random()-0.5)),1.0);
        var g = Math.min(Math.max(0.0,base_col.y + pixel_var*(Math.random()-0.5)),1.0);
        var b = Math.min(Math.max(0.0,base_col.z + pixel_var*(Math.random()-0.5)),1.0);

        var new_col = new THREE.Vector4(r,g,b,1);

        setElement( idx, colors, new_col );
        // ----------- STUDENT CODE END ------------
    }
    colors.needUpdate = true;
}

AnimationInitializer.prototype.initializeSizes = function ( sizes, toSpawn) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var siz_scal = 2;
        setElement( idx, sizes, this._opts.size + Math.max(0,Math.floor((Math.random() - 0.5)*siz_scal)));

        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
}

AnimationInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, lifetimes, this._opts.lifetime );
    }
    lifetimes.needUpdate = true;
}

// how to make this funciton nicer to work with. This one is kinda ok, as for initialization
// everything is independent
AnimationInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    var mesh = this.getMorphedMesh();

    if ( mesh == undefined ){
        return;
    }

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn, mesh );

    this.initializeVelocities( particleAttributes.velocity, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );

};

////////////////////////////////////////////////////////////////////////////////
// Cloth
////////////////////////////////////////////////////////////////////////////////

function ClothInitializer ( opts ) {
    this._opts = opts;
    return this;
};

ClothInitializer.prototype.initializePositions = function ( positions, toSpawn, width, height ) {
    var base_pos = this._opts.position;

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        var w = idx % width;
        var h = idx / height;
        var grid_pos = new THREE.Vector3( 100.0 - w * 10, 0.0, 100.0 - h * 10 );
        var pos = grid_pos.add( base_pos );
        setElement( idx, positions, pos );
    }
    positions.needUpdate = true;
}

ClothInitializer.prototype.initializeVelocities = function ( velocities, toSpawn) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, velocities, base_vel  );
    }
    velocities.needUpdate = true;
}

ClothInitializer.prototype.initializeColors = function ( colors, toSpawn) {
    var base_col = this._opts.color;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        var col = base_col;
        setElement( idx, colors, col );
    }
    colors.needUpdate = true;
}

ClothInitializer.prototype.initializeSizes = function ( sizes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, sizes, 1 );
    }
    sizes.needUpdate = true;
}

ClothInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, lifetimes, Math.INFINITY );
    }
    lifetimes.needUpdate = true;
}


ClothInitializer.prototype.initialize = function ( particleAttributes, toSpawn, width, height ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn, width, height );

    this.initializeVelocities( particleAttributes.velocity, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );

    // mark normals to be updated
    particleAttributes["normal"].needsUpdate = true;

};


////////////////////////////////////////////////////////////////////////////////
// My System
////////////////////////////////////////////////////////////////////////////////


function myInitializer ( opts ) {
    this._opts = opts;
    return this;
};

myInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        // for now we just generate a random point in the unit cube; needs to be fixed

        var pos = new THREE.Vector3(0,(Math.random()-0.5)*1,(Math.random()-0.5)*1+150);
        pos.add(base_pos);

        // ----------- STUDENT CODE END ------------
        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
}

myInitializer.prototype.initializeVelocities = function ( velocities, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        // just to get started, make the velocity the same as the initial position

        var pos = getElement( idx, positions );
        var vel = new THREE.Vector3(10,0,0);

        // ----------- STUDENT CODE END ------------
        setElement( idx, velocities, vel );
    }
    velocities.needUpdate = true;
}

myInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
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
        setElement( idx, colors, new_col );
    }
    colors.needUpdate = true;
}

myInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        
        var siz_scal = 1;
        setElement( idx, sizes, this._opts.size + Math.max(0,Math.floor((Math.random() - 0.5)*siz_scal)));

        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
}

myInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var lifetime = this._opts.lifetime*(0.25 + 1.5*Math.random());

        // ----------- STUDENT CODE END ------------
        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
}

// how to make this funciton nicer to work with. This one is kinda ok, as for initialization
// everything is independent
myInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};


////////////////////////////////////////////////////////////////////////////////
// Axis Box Initializer
////////////////////////////////////////////////////////////////////////////////

function AxisBoxInitializer ( opts ) {
    this._opts = opts;
    return this;
};

AxisBoxInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        // Initial positions at the top of the base, within a square 1/4 of the 
        // area of the top square 
        var pos = new THREE.Vector3(60,30,15);

        // ----------- STUDENT CODE END ------------
        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
}

AxisBoxInitializer.prototype.initializeVelocities = function ( velocities, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var vel = new THREE.Vector3(2*(Math.random() - 0.5),5*(Math.random() - 0.5),10*(Math.random() - 0.5));

        // ----------- STUDENT CODE END ------------
        setElement( idx, velocities, vel );
    }
    velocities.needUpdate = true;
}

AxisBoxInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
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

AxisBoxInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        var siz_scal = 2;
        setElement( idx, sizes, this._opts.size + Math.max(0,Math.floor((Math.random() - 0.5)*siz_scal)));

        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
}

AxisBoxInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];

        var lifetime = this._opts.lifetime;

        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
}

// how to make this funciton nicer to work with. This one is kinda ok, as for initialization
// everything is independent
AxisBoxInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};
