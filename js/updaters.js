/*
 * In this file you can specify all sort of updaters
 *  We provide an example of simple updater that updates pixel positions based on initial velocity and gravity
 */


 // INTENSITY EulerUpdater.prototype.updateVelocities
 // Axis box


////////////////////////////////////////////////////////////////////////////////
// Collisions
////////////////////////////////////////////////////////////////////////////////

var Collisions = Collisions || {};

function reflectPositionAcrossNormal(pos,vel,vel_new,delta_t,plane,planeN) {
    
    var tmp = vel.clone().multiply(planeN).length();
    if (tmp < 1e-10) tmp = 1e-6;
    if (plane.w < 0 && planeN.dot(new THREE.Vector3(1,1,1)) < 0) tmpw = -plane.w;
    else tmpw = plane.w;
    var tmpvec = pos.clone().multiply(planeN).length();
    var delt1 = Math.abs((tmpvec - tmpw))/tmp;
    var delt2 = Math.max(1e-3,delta_t - delt1);

    var posIntersect = pos.clone().add(vel.clone().multiplyScalar(delt1));
    var posNew = posIntersect.clone().add(vel_new.clone().multiplyScalar(delt2));

    return posNew;
}

function reflectVelocityAcrossNormal(vel,planeN,damping) {
    var velNew = vel.clone();
    velNew.sub(planeN.clone().multiplyScalar(2*vel.dot(planeN)));
    return velNew.multiplyScalar(damping);
}

Collisions.BounceBox = function (particleAttributes, alive, delta_t, box, damping) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        var p = pos.clone().add(vel.clone().multiplyScalar(delta_t));
        
        if (p.x > box.xmin && p.x < box.xmax && p.y > box.ymin && p.y < box.ymax && p.z > box.zmin && p.z < box.zmax) {

            if (pos.x < box.xmin) bounceParticle(pos,vel,delta_t,new THREE.Vector4(-1,0,0,box.xmin),damping,i,positions,velocities);
            else if (pos.y < box.ymin) bounceParticle(pos,vel,delta_t,new THREE.Vector4(0,-1,0,box.ymin),damping,i,positions,velocities);
            else if (pos.z < box.zmin) bounceParticle(pos,vel,delta_t,new THREE.Vector4(0,0,-1,box.zmin),damping,i,positions,velocities);

            else if (pos.x > box.xmax) bounceParticle(pos,vel,delta_t,new THREE.Vector4(1,0,0,box.xmax),damping,i,positions,velocities);
            else if (pos.y > box.ymax) bounceParticle(pos,vel,delta_t,new THREE.Vector4(0,1,0,box.ymax),damping,i,positions,velocities);
            else if (pos.z > box.zmax) bounceParticle(pos,vel,delta_t,new THREE.Vector4(0,0,1,box.zmax),damping,i,positions,velocities);
            else killPartilce(i, particleAttributes, alive);
        }
    }
}

Collisions.SinkBox = function (particleAttributes, alive, delta_t, box, damping) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        var p = pos.clone().add(vel.clone().multiplyScalar(delta_t));
        
        if (p.x > box.xmin && p.x < box.xmax && p.y > box.ymin && p.y < box.ymax && p.z > box.zmin && p.z < box.zmax) {

            if (pos.x < box.xmin) sinkParticle(pos,vel,delta_t,new THREE.Vector4(-1,0,0,box.xmin),damping,i,particleAttributes,alive);
            else if (pos.y < box.ymin) sinkParticle(pos,vel,delta_t,new THREE.Vector4(0,-1,0,box.ymin),damping,i,particleAttributes,alive);
            else if (pos.z < box.zmin) sinkParticle(pos,vel,delta_t,new THREE.Vector4(0,0,-1,box.zmin),damping,i,particleAttributes,alive);

            else if (pos.x > box.xmax) sinkParticle(pos,vel,delta_t,new THREE.Vector4(1,0,0,box.xmax),damping,i,particleAttributes,alive);
            else if (pos.y > box.ymax) sinkParticle(pos,vel,delta_t,new THREE.Vector4(0,1,0,box.ymax),damping,i,particleAttributes,alive);
            else if (pos.z > box.zmax) sinkParticle(pos,vel,delta_t,new THREE.Vector4(0,0,1,box.zmax),damping,i,particleAttributes,alive);
            else killPartilce(i, particleAttributes, alive);
        }
    }
}

sinkParticle = function(pos,vel,delta_t,plane,damping,i,particleAttributes,alive) {
    var planeN = new THREE.Vector3(plane.x,plane.y,plane.z);

    var tmp = pos.clone();
    tmp.sub(planeN.clone().multiply(planeN).multiplyScalar(plane.w));
    tmp.add(vel.clone().multiplyScalar(delta_t));
    var finalDir = tmp.dot(planeN)/tmp.lengthSq();

    if (finalDir < 0.0) {
        killPartilce(i, particleAttributes, alive);
    }
}

bounceParticle = function(pos,vel,delta_t,plane,damping,i,positions,velocities) {

    var planeN = new THREE.Vector3(plane.x,plane.y,plane.z);

    var tmp = pos.clone();
    tmp.sub(planeN.clone().multiply(planeN).multiplyScalar(plane.w));
    tmp.add(vel.clone().multiplyScalar(delta_t));
    var finalDir = tmp.dot(planeN);

    if (finalDir < 0.0) {
        vel_new = reflectVelocityAcrossNormal(vel,planeN,damping);
        pos = reflectPositionAcrossNormal(pos,vel,vel_new,delta_t,plane,planeN)
        vel = vel_new;

    }

    setElement( i, positions, pos );
    setElement( i, velocities, vel );
}


Collisions.BouncePlane = function ( particleAttributes, alive, delta_t, plane,damping ) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        // ----------- STUDENT CODE BEGIN ------------

        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        var planeN = new THREE.Vector3(plane.x,plane.y,plane.z);

        var tmp = pos.clone();
        tmp.sub(planeN.clone().multiply(planeN).multiplyScalar(plane.w));
        tmp.add(vel.clone().multiplyScalar(delta_t));
        var finalDir = tmp.dot(planeN)/tmp.lengthSq();

        if (finalDir < 0.0) {
            vel_new = reflectVelocityAcrossNormal(vel,planeN,damping);
            pos = reflectPositionAcrossNormal(pos,vel,vel_new,delta_t,plane,planeN)
            vel = vel_new;
        }

        setElement( i, positions, pos );
        setElement( i, velocities, vel );

        // ----------- STUDENT CODE END ------------
    }
};

Collisions.SinkPlane = function ( particleAttributes, alive, delta_t, plane  ) {
    var positions   = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        // particles are killed when they hit the ground
        var planeN = new THREE.Vector3(plane.x,plane.y,plane.z);

        var tmp = pos.clone();
        tmp.sub(planeN.clone().multiply(planeN).multiplyScalar(plane.w));
        tmp.add(vel.clone().multiplyScalar(delta_t));
        var finalDir = tmp.dot(planeN)/tmp.lengthSq();

        if (finalDir < 0.0) {
            killPartilce(i, particleAttributes, alive);
        }

        // ----------- STUDENT CODE END ------------
    }
};

Collisions.BounceSphere = function ( particleAttributes, alive, delta_t, sphere, damping ) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    var sphereCenter = new THREE.Vector3(sphere.x,sphere.y,sphere.z);
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        var newpos = pos.clone().add(vel.clone().multiplyScalar(delta_t));

        if (newpos.distanceTo(sphereCenter) < sphere.w) {
            var radVec = (new THREE.Vector3()).subVectors(sphereCenter,pos).normalize();
            var normVel = radVec.clone().multiplyScalar(radVec.dot(vel));
            var tangVel = (new THREE.Vector3()).subVectors(vel,normVel.clone());

            pos = radVec.clone().normalize().multiplyScalar(-(sphere.w + 1e-3)).add(sphereCenter); 
            vel = tangVel.clone().add(normVel.clone().multiplyScalar(-damping));
        }

        setElement( i, positions, pos );
        setElement( i, velocities, vel );
        // ----------- STUDENT CODE END ------------
    }
}

////////////////////////////////////////////////////////////////////////////////
// Null updater - does nothing
////////////////////////////////////////////////////////////////////////////////

function VoidUpdater ( opts ) {
    this._opts = opts;
    return this;
};

VoidUpdater.prototype.update = function ( particleAttributes, initialized, delta_t ) {
    //do nothing
};

////////////////////////////////////////////////////////////////////////////////
// Euler updater
////////////////////////////////////////////////////////////////////////////////

function EulerUpdater ( opts ) {
    this._opts = opts;
    return this;
};


EulerUpdater.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

EulerUpdater.prototype.updateVelocities = function ( particleAttributes, alive, delta_t ) {

    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    var G = 10000;
    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        // // ----------- STUDENT CODE BEGIN ------------
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        // now update velocity based on forces...

        var f = gravity.clone(); // DOES THIS NEED TO BE SCALED

        for (var j = 0; j < attractors.length; j++) {
            var tmp = (new THREE.Vector3()).subVectors(attractors[j].center,p);
            var dSq = tmp.lengthSq();
            tmp.normalize().multiplyScalar(G*attractors[j].radius/(1 + dSq)); // INTENSITY EQUATION?
            f.add(tmp);
        }
        v.add( f.multiplyScalar( delta_t ) ); // MILLISECONDS?

        setElement( i, velocities, v );

        // ----------- STUDENT CODE END ------------
    }

};

EulerUpdater.prototype.updateColors = function ( particleAttributes, alive, delta_t ) {
    var colors    = particleAttributes.color;
    var lifetimes = particleAttributes.lifetime.array;
    var maxlife = Math.max(0,Math.max.apply( Math, lifetimes )*0.5);
   
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var c = getElement( i, colors );

        var rgb_scal = 0.05;
        if (Math.random() < 0.01) {
            c.x = Math.round(Math.random());
            c.y = Math.round(Math.random());
        }
        else {
            c.x = Math.min(Math.max(0,c.x + rgb_scal*(Math.random() - 0.5)));
            c.y = Math.min(Math.max(0,c.y + rgb_scal*(Math.random() - 0.5)));
            c.z = Math.min(Math.max(0,c.z + rgb_scal*(Math.random() - 0.5)));
            c.w = lifetimes[i]/maxlife;
        }

        setElement( i, colors, c );
        // ----------- STUDENT CODE END ------------
    }
};

EulerUpdater.prototype.updateSizes= function ( particleAttributes, alive, delta_t ) {
    var sizes    = particleAttributes.size;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var s = getElement( i, sizes );

        setElement( i, sizes, s );
        // ----------- STUDENT CODE END ------------
    }

};

EulerUpdater.prototype.updateLifetimes = function ( particleAttributes, alive, delta_t) {
    var positions     = particleAttributes.position;
    var lifetimes     = particleAttributes.lifetime;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        var lifetime = getElement( i, lifetimes );

        if ( lifetime < 0 ) {
            killPartilce( i, particleAttributes, alive );
        } else {
            setElement( i, lifetimes, lifetime - delta_t );
        }
    }

};

EulerUpdater.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    if ( this._opts.collidables.bouncePlanes ) {
        for (var i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            var plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            var plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.spheres ) {
        for (var i = 0 ; i < this._opts.collidables.spheres.length ; ++i ) {
            Collisions.Sphere( particleAttributes, alive, delta_t, this._opts.collidables.spheres[i] );
        }
    }


    if ( this._opts.collidables.sinkBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.sinkBoxes[i].boxDef;
            var damping = this._opts.collidables.sinkBoxes[i].damping;
            Collisions.SinkBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }

    if ( this._opts.collidables.bounceBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.bounceBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.bounceBoxes[i].boxDef;
            var damping = this._opts.collidables.bounceBoxes[i].damping;
            Collisions.BounceBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }
};

EulerUpdater.prototype.update = function ( particleAttributes, alive, delta_t ) {

    this.updateLifetimes( particleAttributes, alive, delta_t );
    this.updateVelocities( particleAttributes, alive, delta_t );
    this.updatePositions( particleAttributes, alive, delta_t );

    this.collisions( particleAttributes, alive, delta_t );

    this.updateColors( particleAttributes, alive, delta_t );
    this.updateSizes( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;

}

////////////////////////////////////////////////////////////////////////////////
// FRIEND UPDATER (LEVEL 0)
////////////////////////////////////////////////////////////////////////////////

function TargetUpdater0 ( opts ) {
    this._opts = opts;
    return this;
};


TargetUpdater0.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

TargetUpdater0.prototype.updateVelocities = function ( particleAttributes, alive, delta_t ) {

    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    var G = 10000;
    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        // // ----------- STUDENT CODE BEGIN ------------
        var v = getElement( i, velocities );
        // now update velocity based on forces...

        if (Math.random() < 0.7) {
            var scal = 10.0;
            v.add(new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random()) - 0.5));
        }
        else {
            var scal = 10.0;
            v = new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random() - 0.5));
        }

        setElement( i, velocities, v );

        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater0.prototype.updateColors = function ( particleAttributes, alive, delta_t ) {
    var colors    = particleAttributes.color;
    var lifetimes = particleAttributes.lifetime.array;
    var maxlife = Math.max(0,Math.max.apply( Math, lifetimes )*0.5);
   
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var c = getElement( i, colors );

        var rgb_scal = 0.05;
        if (Math.random() < 0.01) {
            c.x = Math.round(Math.random());
            c.y = Math.round(Math.random());
        }
        else {
            c.x = Math.min(Math.max(0,c.x + rgb_scal*(Math.random() - 0.5)));
            c.y = Math.min(Math.max(0,c.y + rgb_scal*(Math.random() - 0.5)));
            c.z = Math.min(Math.max(0,c.z + rgb_scal*(Math.random() - 0.5)));
            c.w = lifetimes[i]/maxlife;
        }

        setElement( i, colors, c );
        // ----------- STUDENT CODE END ------------
    }
};

TargetUpdater0.prototype.updateSizes= function ( particleAttributes, alive, delta_t ) {
    var sizes    = particleAttributes.size;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var s = getElement( i, sizes );

        setElement( i, sizes, s );
        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater0.prototype.updateLifetimes = function ( particleAttributes, alive, delta_t) {
    var positions     = particleAttributes.position;
    var lifetimes     = particleAttributes.lifetime;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        var lifetime = getElement( i, lifetimes );

        if ( lifetime < 0 ) {
            killPartilce( i, particleAttributes, alive );
        } else {
            setElement( i, lifetimes, lifetime - delta_t );
        }
    }

};

TargetUpdater0.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    if ( this._opts.collidables.bouncePlanes ) {
        for (var i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            var plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            var plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.spheres ) {
        for (var i = 0 ; i < this._opts.collidables.spheres.length ; ++i ) {
            Collisions.Sphere( particleAttributes, alive, delta_t, this._opts.collidables.spheres[i] );
        }
    }


    if ( this._opts.collidables.sinkBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.sinkBoxes[i].boxDef;
            var damping = this._opts.collidables.sinkBoxes[i].damping;
            Collisions.SinkBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }

    if ( this._opts.collidables.bounceBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.bounceBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.bounceBoxes[i].boxDef;
            var damping = this._opts.collidables.bounceBoxes[i].damping;
            Collisions.BounceBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }
};

TargetUpdater0.prototype.update = function ( particleAttributes, alive, delta_t ) {

    this.updateLifetimes( particleAttributes, alive, delta_t );
    this.updateVelocities( particleAttributes, alive, delta_t );
    this.updatePositions( particleAttributes, alive, delta_t );

    this.collisions( particleAttributes, alive, delta_t );

    this.updateColors( particleAttributes, alive, delta_t );
    this.updateSizes( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;

}

////////////////////////////////////////////////////////////////////////////////
// FRIEND UPDATER (LEVEL 1)
////////////////////////////////////////////////////////////////////////////////

function TargetUpdater1 ( opts ) {
    this._opts = opts;
    return this;
};


TargetUpdater1.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

TargetUpdater1.prototype.updateVelocities = function ( particleAttributes, alive, delta_t ) {

    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    var G = 10000;
    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        // // ----------- STUDENT CODE BEGIN ------------
        var v = getElement( i, velocities );
        // now update velocity based on forces...

        if (Math.random() < 0.7) {
            var scal = 10.0;
            v.add(new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random()) - 0.5));
        }
        else {
            var scal = 10.0;
            v = new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random() - 0.5));
        }

        setElement( i, velocities, v );

        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater1.prototype.updateColors = function ( particleAttributes, alive, delta_t ) {
    var colors    = particleAttributes.color;
    var lifetimes = particleAttributes.lifetime.array;
    var maxlife = Math.max(0,Math.max.apply( Math, lifetimes )*0.5);
   
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var c = getElement( i, colors );

        var rgb_scal = 0.05;
        if (Math.random() < 0.01) {
            c.x = Math.round(Math.random());
            c.y = Math.round(Math.random());
        }
        else {
            c.x = Math.min(Math.max(0,c.x + rgb_scal*(Math.random() - 0.5)));
            c.y = Math.min(Math.max(0,c.y + rgb_scal*(Math.random() - 0.5)));
            c.z = Math.min(Math.max(0,c.z + rgb_scal*(Math.random() - 0.5)));
            c.w = lifetimes[i]/maxlife;
        }

        setElement( i, colors, c );
        // ----------- STUDENT CODE END ------------
    }
};

TargetUpdater1.prototype.updateSizes= function ( particleAttributes, alive, delta_t ) {
    var sizes    = particleAttributes.size;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var s = getElement( i, sizes );

        setElement( i, sizes, s );
        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater1.prototype.updateLifetimes = function ( particleAttributes, alive, delta_t) {
    var positions     = particleAttributes.position;
    var lifetimes     = particleAttributes.lifetime;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        var lifetime = getElement( i, lifetimes );

        if ( lifetime < 0 ) {
            killPartilce( i, particleAttributes, alive );
        } else {
            setElement( i, lifetimes, lifetime - delta_t );
        }
    }

};

TargetUpdater1.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    if ( this._opts.collidables.bouncePlanes ) {
        for (var i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            var plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            var plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.spheres ) {
        for (var i = 0 ; i < this._opts.collidables.spheres.length ; ++i ) {
            Collisions.Sphere( particleAttributes, alive, delta_t, this._opts.collidables.spheres[i] );
        }
    }


    if ( this._opts.collidables.sinkBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.sinkBoxes[i].boxDef;
            var damping = this._opts.collidables.sinkBoxes[i].damping;
            Collisions.SinkBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }

    if ( this._opts.collidables.bounceBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.bounceBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.bounceBoxes[i].boxDef;
            var damping = this._opts.collidables.bounceBoxes[i].damping;
            Collisions.BounceBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }
};

TargetUpdater1.prototype.update = function ( particleAttributes, alive, delta_t ) {

    this.updateLifetimes( particleAttributes, alive, delta_t );
    this.updateVelocities( particleAttributes, alive, delta_t );
    this.updatePositions( particleAttributes, alive, delta_t );

    this.collisions( particleAttributes, alive, delta_t );

    this.updateColors( particleAttributes, alive, delta_t );
    this.updateSizes( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;

}

////////////////////////////////////////////////////////////////////////////////
// FRIEND UPDATER (LEVEL 2)
////////////////////////////////////////////////////////////////////////////////

function TargetUpdater2 ( opts ) {
    this._opts = opts;
    return this;
};


TargetUpdater2.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

TargetUpdater2.prototype.updateVelocities = function ( particleAttributes, alive, delta_t ) {

    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    var G = 10000;
    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        // // ----------- STUDENT CODE BEGIN ------------
        var v = getElement( i, velocities );
        // now update velocity based on forces...

        if (Math.random() < 0.7) {
            var scal = 10.0;
            v.add(new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random()) - 0.5));
        }
        else {
            var scal = 10.0;
            v = new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random() - 0.5));
        }

        setElement( i, velocities, v );

        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater2.prototype.updateColors = function ( particleAttributes, alive, delta_t ) {
    var colors    = particleAttributes.color;
    var lifetimes = particleAttributes.lifetime.array;
    var maxlife = Math.max(0,Math.max.apply( Math, lifetimes )*0.5);
   
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var c = getElement( i, colors );

        var rgb_scal = 0.05;
        if (Math.random() < 0.01) {
            c.x = Math.round(Math.random());
            c.y = Math.round(Math.random());
        }
        else {
            c.x = Math.min(Math.max(0,c.x + rgb_scal*(Math.random() - 0.5)));
            c.y = Math.min(Math.max(0,c.y + rgb_scal*(Math.random() - 0.5)));
            c.z = Math.min(Math.max(0,c.z + rgb_scal*(Math.random() - 0.5)));
            c.w = lifetimes[i]/maxlife;
        }

        setElement( i, colors, c );
        // ----------- STUDENT CODE END ------------
    }
};

TargetUpdater2.prototype.updateSizes= function ( particleAttributes, alive, delta_t ) {
    var sizes    = particleAttributes.size;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var s = getElement( i, sizes );

        setElement( i, sizes, s );
        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater2.prototype.updateLifetimes = function ( particleAttributes, alive, delta_t) {
    var positions     = particleAttributes.position;
    var lifetimes     = particleAttributes.lifetime;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        var lifetime = getElement( i, lifetimes );

        if ( lifetime < 0 ) {
            killPartilce( i, particleAttributes, alive );
        } else {
            setElement( i, lifetimes, lifetime - delta_t );
        }
    }

};

TargetUpdater2.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    if ( this._opts.collidables.bouncePlanes ) {
        for (var i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            var plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            var plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.spheres ) {
        for (var i = 0 ; i < this._opts.collidables.spheres.length ; ++i ) {
            Collisions.Sphere( particleAttributes, alive, delta_t, this._opts.collidables.spheres[i] );
        }
    }


    if ( this._opts.collidables.sinkBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.sinkBoxes[i].boxDef;
            var damping = this._opts.collidables.sinkBoxes[i].damping;
            Collisions.SinkBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }

    if ( this._opts.collidables.bounceBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.bounceBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.bounceBoxes[i].boxDef;
            var damping = this._opts.collidables.bounceBoxes[i].damping;
            Collisions.BounceBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }
};

TargetUpdater2.prototype.update = function ( particleAttributes, alive, delta_t ) {

    this.updateLifetimes( particleAttributes, alive, delta_t );
    this.updateVelocities( particleAttributes, alive, delta_t );
    this.updatePositions( particleAttributes, alive, delta_t );

    this.collisions( particleAttributes, alive, delta_t );

    this.updateColors( particleAttributes, alive, delta_t );
    this.updateSizes( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;

}

////////////////////////////////////////////////////////////////////////////////
// FRIEND UPDATER (LEVEL 3)
////////////////////////////////////////////////////////////////////////////////

function TargetUpdater3 ( opts ) {
    this._opts = opts;
    return this;
};


TargetUpdater3.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

TargetUpdater3.prototype.updateVelocities = function ( particleAttributes, alive, delta_t ) {

    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    var G = 10000;
    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        // // ----------- STUDENT CODE BEGIN ------------
        var v = getElement( i, velocities );
        // now update velocity based on forces...

        if (Math.random() < 0.7) {
            var scal = 10.0;
            v.add(new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random()) - 0.5));
        }
        else {
            var scal = 10.0;
            v = new THREE.Vector3(scal*(Math.random() - 0.5),0,scal*(Math.random() - 0.5));
        }

        setElement( i, velocities, v );

        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater3.prototype.updateColors = function ( particleAttributes, alive, delta_t ) {
    var colors    = particleAttributes.color;
    var lifetimes = particleAttributes.lifetime.array;
    var maxlife = Math.max(0,Math.max.apply( Math, lifetimes )*0.5);
   
    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var c = getElement( i, colors );

        var rgb_scal = 0.05;
        if (Math.random() < 0.01) {
            c.x = Math.round(Math.random());
            c.y = Math.round(Math.random());
        }
        else {
            c.x = Math.min(Math.max(0,c.x + rgb_scal*(Math.random() - 0.5)));
            c.y = Math.min(Math.max(0,c.y + rgb_scal*(Math.random() - 0.5)));
            c.z = Math.min(Math.max(0,c.z + rgb_scal*(Math.random() - 0.5)));
            c.w = lifetimes[i]/maxlife;
        }

        setElement( i, colors, c );
        // ----------- STUDENT CODE END ------------
    }
};

TargetUpdater3.prototype.updateSizes= function ( particleAttributes, alive, delta_t ) {
    var sizes    = particleAttributes.size;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var s = getElement( i, sizes );

        setElement( i, sizes, s );
        // ----------- STUDENT CODE END ------------
    }

};

TargetUpdater3.prototype.updateLifetimes = function ( particleAttributes, alive, delta_t) {
    var positions     = particleAttributes.position;
    var lifetimes     = particleAttributes.lifetime;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        var lifetime = getElement( i, lifetimes );

        if ( lifetime < 0 ) {
            killPartilce( i, particleAttributes, alive );
        } else {
            setElement( i, lifetimes, lifetime - delta_t );
        }
    }

};

TargetUpdater3.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    if ( this._opts.collidables.bouncePlanes ) {
        for (var i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            var plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            var plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.spheres ) {
        for (var i = 0 ; i < this._opts.collidables.spheres.length ; ++i ) {
            Collisions.Sphere( particleAttributes, alive, delta_t, this._opts.collidables.spheres[i] );
        }
    }


    if ( this._opts.collidables.sinkBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.sinkBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.sinkBoxes[i].boxDef;
            var damping = this._opts.collidables.sinkBoxes[i].damping;
            Collisions.SinkBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }

    if ( this._opts.collidables.bounceBoxes ) {
        for (var i = 0 ; i < this._opts.collidables.bounceBoxes.length ; ++i ) {
            var boxDef = this._opts.collidables.bounceBoxes[i].boxDef;
            var damping = this._opts.collidables.bounceBoxes[i].damping;
            Collisions.BounceBox( particleAttributes, alive, delta_t, boxDef, damping );
        }
    }
};

TargetUpdater3.prototype.update = function ( particleAttributes, alive, delta_t ) {

    this.updateLifetimes( particleAttributes, alive, delta_t );
    this.updateVelocities( particleAttributes, alive, delta_t );
    this.updatePositions( particleAttributes, alive, delta_t );

    this.collisions( particleAttributes, alive, delta_t );

    this.updateColors( particleAttributes, alive, delta_t );
    this.updateSizes( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;

}

