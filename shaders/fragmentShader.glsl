// set the precision of the float values (necessary if using float)
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
precision mediump int;

// define constant parameters
// EPS is for the precision issue (see precept slide)
#define INFINITY 1.0e+12
#define EPS 1.0e-3
#define PI 3.1415926535897932384626433832795

// define constants for scene setting 
#define MAX_LIGHTS 10

// define texture types
#define NONE 0
#define CHECKERBOARD 1
#define MYSPECIAL 2

// define material types
#define BASICMATERIAL 1
#define PHONGMATERIAL 2
#define LAMBERTMATERIAL 3

// define reflect types - how to bounce rays
#define NONEREFLECT 1
#define MIRRORREFLECT 2
#define GLASSREFLECT 3

struct Shape {
    int shapeType;
    vec3 v1;
    vec3 v2;
    float rad;
};

struct Material {
    int materialType;
    vec3 color;
    float shininess;
    vec3 specular;

    int materialReflectType;
    float reflectivity; 
    float refractionRatio;
    int special;

};

struct Object {
    Shape shape;
    Material material;
};

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
    float attenuate;
};

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Intersection {
    vec3 position;
    vec3 normal;
};

// uniform
uniform mat4 uMVMatrix;
uniform int frame;        
uniform float height;
uniform float width;
uniform vec3 camera;
uniform int numObjects;
uniform int numLights;
uniform Light lights[MAX_LIGHTS];
uniform vec3 objectNorm;

varying vec2 v_position;

// find then position some distance along a ray
vec3 rayGetOffset( Ray ray, float dist ) {
    return ray.origin + ( dist * ray.direction );
}

// if a newly found intersection is closer than the best found so far, record the new intersection and return true;
// otherwise leave the best as it was and return false.
bool chooseCloserIntersection( float dist, inout float best_dist, inout Intersection intersect, inout Intersection best_intersect ) {
    if ( best_dist <= dist ) return false;
    best_dist = dist;
    best_intersect.position = intersect.position;
    best_intersect.normal   = intersect.normal;
    return true;
}

// ------------------------------------------------------------------------------------------

// Area of a triangle defined by three vertices and normal to plane
float getArea(vec3 p1, vec3 p2, vec3 p3, vec3 N) {
    float area = dot(cross(p2 - p1, p3 - p1), N);
    return 0.5*area;
}

// Hash function found online
// http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float hash( float n )
{
    return fract(sin(n)*43758.5453);
}

// Generate noise from 3D vector (between -1 and 1)
// http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float noise3d(vec3 invec) {

    vec3 p = floor(invec);
    vec3 f = fract(invec);

    f = f*f*(3.0 - 2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;

    return mix(mix(mix( hash(n+0.0), hash(n+1.0),f.x),
                   mix( hash(n+57.0), hash(n+58.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

// Generate noise from 2D vector
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float noise2d(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

// Based on index a, return one of 12 possible gradient vectors
vec3 returnGradientVec(int a) {
    vec3 grad = vec3(0,0,0);
    if (a < 1) grad = vec3(1.0,1.0,0.0);
    else if (a < 2) grad = vec3(-1.0,1.0,0.0);
    else if (a < 3) grad = vec3(1.0,-1.0,0.0);
    else if (a < 4) grad = vec3(-1.0,-1.0,0.0);
    else if (a < 5) grad = vec3(1.0,0.0,1.0);
    else if (a < 6) grad = vec3(-1.0,0.0,1.0);
    else if (a < 7) grad = vec3(1.0,0.0,-1.0);
    else if (a < 8) grad = vec3(-1.0,0.0,-1.0);
    else if (a < 9) grad = vec3(0.0,1.0,1.0);
    else if (a < 10) grad = vec3(0.0,-1.0,1.0);
    else if (a < 11) grad = vec3(0.0,1.0,-1.0);
    else grad = vec3(0.0,-1.0,-1.0);

    return grad;
}

// Helper function used to generate random 3d vector
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
vec3 randLightVector(int i, int j, int m) {
    float x1 = noise2d(vec2(float(i),float(j)));
    float x2 = noise2d(vec2(float(j),float(m)));

    if (x1*x1 + x2*x2 > 1.0) return vec3(-1.0,-1.0,-1.0);

    // Generate 3D vector
    float a = 2.0*x1*sqrt(1.0 - x1*x1 - x2*x2);
    float b = 2.0*x2*sqrt(1.0 - x1*x1 - x2*x2);
    float c = 1.0 - 2.0*(x1*x1 + x2*x2);
    return vec3(a,b,c);
}

// ------------------------------------------------------------------------------------------


// forward declaration
float rayIntersectScene( Ray ray, out Material out_mat, out Intersection out_intersect );

// Plane
// this function can be used for plane, triangle, and box
float findIntersectionWithPlane( Ray ray, vec3 norm, float dist, out Intersection intersect ) {
    float a   = dot( ray.direction, norm );
    float b   = dot( ray.origin, norm ) - dist;
    
    if ( a < 0.0 && a > 0.0) return INFINITY;
    
    float len = -b/a;
    if ( len < EPS ) return INFINITY;

    intersect.position = rayGetOffset( ray, len );
    intersect.normal   = norm;
    return len;
}

// Triangle
float findIntersectionWithTriangle( Ray ray, vec3 t1, vec3 t2, vec3 t3, out Intersection intersect ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 22 lines of code.

    // Find normal to plane containing triangle
    vec3 norm = cross(t2 - t1, t3 - t1);
    norm = 1.0/length(norm)*norm;
    float dist = dot(t1, norm); // distance from plane to camera

    // See if ray intersects plane with the triangle on it
    float a   = dot( ray.direction, norm ); 
    float b   = dot( ray.origin, norm ) - dist;
    
    // If ray is perpendicular to norm (parallel to plane)
    if ( a < 0.0 && a > 0.0) return INFINITY;
    
    // Find distance from light to plane, and check that it's not negative (which would 
    // mean the ray is pointing away from plane)
    float len = -b/a;
    if ( len < EPS ) return INFINITY;

    // If code gets here, means that ray intersects the plane, so now check if inside triangle
    vec3 P = rayGetOffset( ray, len ); // point of intersection with plane

    // Use geometric method to see if point is inside triangle
    // Check that alpha, beta and gamma fall between 0 and 1

    // NOTE: I am purposefully not using EPS in the if statements below. I initially used EPS
    // in the same way it is applied to len above and the edges of the triangle were not very 
    // clean (there were little specks and at times thin black lines reflected in the box). 
    // Removing them made the triangle much more defined, so I exclude EPS below. 

    float alpha = getArea(t1,t2,P,norm)/getArea(t1,t2,t3,norm);
    if (alpha < 0.0 || alpha > 1.0) return INFINITY;
    
    float beta = getArea(t1,P,t3,norm)/getArea(t1,t2,t3,norm);
    if (beta < 0.0 || beta > 1.0) return INFINITY;

    float gamma = 1.0 - alpha - beta;
    if (gamma < 0.0) return INFINITY;

    intersect.position = P;
    intersect.normal   = norm;
    
    return len;
}

// Sphere
float findIntersectionWithSphere( Ray ray, vec3 center, float radius, out Intersection intersect ) {   
    
    // Vector between light and center of sphere
    vec3 L = center - ray.origin;
    
    // Distance from light to center of sphere 
    float tca = dot(L, ray.direction);
    if (tca < 0.0) return INFINITY; // purposefully do not use EPS here, does not make sense to

    // Half distance of chord connecting points of intersection 
    float dsq = dot(L, L) - tca*tca;
    if (radius*radius - dsq < 0.0) return INFINITY; // again not using EPS

    // Find closest point of intersection if it exists
    float thc = sqrt(radius*radius - dsq);
    float t1 = tca - thc;
    float t2 = tca + thc;
    float t = 0.0;
    if (t1 > EPS) t = t1;
    else if (t2 > EPS) t = t2;
    else return INFINITY;

    // Point of intersection
    intersect.position = rayGetOffset( ray, t );

    // Find normal
    vec3 norm = intersect.position - center;
    norm = 1.0/length(norm)*norm;
    intersect.normal   = norm;

    return t;
}


// Box
float findIntersectionWithBox( Ray ray, vec3 pmin, vec3 pmax, out Intersection out_intersect ) {
    // pmin and pmax represent two bounding points of the box
    // pmin stores [xmin, ymin, zmin] and pmax stores [xmax, ymax, zmax]

    const int numFaces = 6; // number of faces in box

    // Vector normals to six faces of axis-aligned box
    vec3 norm[numFaces];
    norm[0] = vec3(0,0,-1.0); norm[1] = vec3(0,-1.0,0); norm[2] = vec3(-1.0,0,0);
    norm[3] = vec3(0,0,1.0); norm[4] = vec3(0,1.0,0); norm[5] = vec3(1.0,0,0);

    // The distances from the box to camera corresponding with sides above
    float dist[numFaces];
    dist[0] = -pmin.z; dist[1] = -pmin.y; dist[2] = -pmin.x;
    dist[3] = pmax.z; dist[4] = pmax.y; dist[5] = pmax.x;

    float tmin = INFINITY; // minimum distance found
    vec3 normmin; // normal for closest face
    
    float t = 0.0; // tracks distance of current face
    int found = -1; // whether or not a face of intersection has been found

    // Iterate through faces, check for intersection with plane then check for
    // intersection inside box
    for (int i = 0; i < numFaces; i++) {

        // Check for intersection with the face plane
        float a   = dot( ray.direction, norm[i] );
        float b   = dot( ray.origin, norm[i] ) - dist[i];

        if ( a < 0.0 && a > 0.0 ) t = INFINITY;
        else {
            t = -b/a;
            if ( t < EPS ) t = INFINITY;
        }

        // If intersection is closer than previous intersections, check if it
        // is inside the rectangle defining the box's side 
        if (t < tmin) {
            vec3 tmp = rayGetOffset( ray, t ); // point of intersection

            if (tmp.x < pmax.x + EPS && tmp.x > pmin.x - EPS &&
                    tmp.y < pmax.y + EPS && tmp.y > pmin.y - EPS &&
                    tmp.z < pmax.z + EPS && tmp.z > pmin.z - EPS) {
                normmin = norm[i];
                tmin = t;
                found = 1;
            }
        }
    }

    if (found < 0) return INFINITY; // no intersection was found

    vec3 P = rayGetOffset( ray, tmin );
    out_intersect.position = P;
    out_intersect.normal   = normmin;

    return tmin;
}  

// Cylinder
float getIntersectOpenCylinder( Ray ray, vec3 center, vec3 axis, float len, float rad, out Intersection intersect ) {

    // Find coefficients to quadratic equation defining the open cylinder
    vec3 delp = ray.origin - center;
    vec3 tmp = ray.direction - dot(ray.direction,axis)*axis;
    float A = dot(tmp,tmp);
    float B = 2.0*dot(ray.direction - dot(ray.direction,axis)*axis, delp - dot(delp, axis)*axis);
    tmp = delp - dot(delp,axis)*axis;
    float C = dot(tmp,tmp) - rad*rad;

    // check for nonexistent or nonreal t
    float discr = B*B - 4.0*A*C;
    if (discr < EPS) return INFINITY;

    // solve quadratic formula for t
    float t1 = (-B - sqrt(discr))/2.0/A;
    float t2 = (-B + sqrt(discr))/2.0/A;
    float t = 0.0;
    if (t1 < EPS) {  // make sure t is positive
        if (t2 < EPS) return INFINITY;
        else t = t2;
    }
    else {
        if (t2 < EPS) t = t1;
        else t = min(t1,t2);
    }

    // Make sure point of intersection is between the two planes 
    vec3 P = rayGetOffset( ray, t );
    if (dot(P - center, axis) > len|| dot(P - center, axis) < 0.0) return INFINITY; // purposefully do not use EPS, cleaner results

    intersect.position = P;
    intersect.normal   = normalize((P - center) - dot(P - center, axis)*axis);

    return t; // currently reports no intersection
}

float getIntersectDisc( Ray ray, vec3 center, vec3 norm, float rad, out Intersection intersect ) {
    
    // Check for intersection with the plane of the disc as done before
    float a   = dot( ray.direction, norm );
    float b   = dot( ray.origin, norm ) - dot(norm,center);
    if ( a < 0.0 && a > 0.0 ) return INFINITY;
    float len = -b/a;
    if ( len < EPS ) return INFINITY;

    // If an intersection exists, make sure it falls inside the circle centered at center with 
    // radius rad
    vec3 P = rayGetOffset( ray, len );
    if (distance(P,center) > rad) return INFINITY; // purposefully do not use EPS, cleaner results

    intersect.position = P;
    intersect.normal   = norm;
    return len;
}


float findIntersectionWithCylinder( Ray ray, vec3 center, vec3 apex, float radius, out Intersection out_intersect ) {
    vec3 axis = apex - center;
    float len = length( axis );
    axis = normalize( axis );

    Intersection intersect;
    float best_dist = INFINITY;
    float dist;

    // -- infinite cylinder
    dist = getIntersectOpenCylinder( ray, center, axis, len, radius, intersect );
    chooseCloserIntersection( dist, best_dist, intersect, out_intersect );

    // -- two caps
    dist = getIntersectDisc( ray, center, axis, radius, intersect );
    chooseCloserIntersection( dist, best_dist, intersect, out_intersect );
    dist = getIntersectDisc( ray,   apex, axis, radius, intersect );
    chooseCloserIntersection( dist, best_dist, intersect, out_intersect );

    return best_dist;
}
    
// Cone
float getIntersectOpenCone( Ray ray, vec3 apex, vec3 axis, float len, float radius, out Intersection intersect ) {

    // Half-angle defining cone
    float alpha = atan(radius,len);

    // Vector from apex to light
    vec3 delp = ray.origin - apex;

    // Find coefficients for quadratic equation defining the open cone
    vec3 tmp = ray.direction - dot(ray.direction,axis)*axis;
    float A = dot(tmp,tmp)*pow(cos(alpha),2.0) - pow(sin(alpha),2.0)*pow(dot(ray.direction,axis),2.0);
    float B = 2.0*pow(cos(alpha),2.0)*dot(ray.direction - dot(ray.direction,axis)*axis, delp - dot(delp,axis)*axis);
    B = B - 2.0*pow(sin(alpha),2.0)*dot(ray.direction,axis)*dot(delp,axis);
    tmp = delp - dot(delp,axis)*axis;
    float C = pow(cos(alpha),2.0)*dot(tmp,tmp) - pow(sin(alpha),2.0)*pow(dot(delp,axis),2.0);

    // check for nonexistent or nonreal t
    float discr = B*B - 4.0*A*C;
    if (discr < EPS) return INFINITY;

    // solve quadratic formula for t
    float t1 = (-B - sqrt(discr))/2.0/A;
    float t2 = (-B + sqrt(discr))/2.0/A;
    float t = 0.0;

    // Find closest non-negative solution that is between the two planes defining the cone
    if (t1 < EPS) {  
        if (t2 < EPS) return INFINITY;
        else t = t2;
    }
    else {
        if (t2 < EPS) t = t1;
        else {
            float ttmp = min(t1,t2);
            vec3 Ptmp = rayGetOffset( ray, ttmp );

            // Make sure solution is between two planes
            if (dot(Ptmp - apex, axis) > len || dot(Ptmp - apex, axis) < 0.0) { // purposefully do not use EPS, cleaner results

                ttmp = max(t1,t2);
                vec3 Ptmp = rayGetOffset( ray, ttmp );
                if (dot(Ptmp - apex, axis) > len || dot(Ptmp - apex, axis) < 0.0) return INFINITY; // purposefully do not use EPS, cleaner results
                else t = ttmp;
            }
            else t = ttmp;
        }
    }

    // Point of intersection and just for good measure, check that solution is between two planes
    vec3 P = rayGetOffset( ray, t );
    if (dot(P - apex, axis) > len || dot(P - apex, axis) < 0.0) return INFINITY; // purposefully do not use EPS, cleaner results
    intersect.position = P;

    // Normal is side of a right triangle with the cone axis as a hypotenuse and the vector
    // from apex to point of intersection as a second side
    vec3 E = P - apex;
    intersect.normal   = normalize(E - length(E)/cos(alpha)*axis);

    return t;
}

float findIntersectionWithCone( Ray ray, vec3 center, vec3 apex, float radius, out Intersection out_intersect ) {
    vec3 axis   = center - apex;
    float len   = length( axis );
    axis = normalize( axis );
        
    // -- infinite cone
    Intersection intersect;
    float best_dist = INFINITY;
    float dist;

    // -- infinite cone
    dist = getIntersectOpenCone( ray, apex, axis, len, radius, intersect );
    chooseCloserIntersection( dist, best_dist, intersect, out_intersect );

    // -- caps
    dist = getIntersectDisc( ray, center, axis, radius, intersect );
    chooseCloserIntersection( dist, best_dist, intersect, out_intersect );

    return best_dist;
}

#define MAX_RECURSION 8

vec3 calculateSpecialDiffuseColor( Material mat, vec3 posIntersection, vec3 normalVector ) {
    if ( mat.special == CHECKERBOARD ) {
        vec3 newPos = posIntersection - dot(posIntersection,normalVector)*normalVector;
        newPos = 0.095*posIntersection;

        // Now, use all coordinates of newPos to make checkerboard
        if (mod((floor(newPos.x) + floor(newPos.y) + floor(newPos.z)),2.0) < EPS
                && mod((floor(newPos.x) + floor(newPos.y) + floor(newPos.z)),2.0) > -EPS) 
            return vec3(1.0,1.0,1.0);
        else return vec3(0.0,0.0,0.0);

    } 
    else if ( mat.special == MYSPECIAL ) {

        // Find position inside new grid
        float f = 3.0;
        vec3 newPos = vec3(0.0,0.0,0.0);
        newPos.x = mod(posIntersection.x, f);
        newPos.y = mod(posIntersection.y, f);
        newPos.z = mod(posIntersection.z, f);

        // Generate three pseudorandom gradient vectors
        vec3 grad1 = returnGradientVec(int(floor((noise3d(posIntersection.xyz) + 1.0)*6.49999)));
        vec3 grad2 = returnGradientVec(int(floor((noise3d(posIntersection.yzx) + 1.0)*6.49999)));
        vec3 grad3 = returnGradientVec(int(floor((noise3d(posIntersection.zxy) + 1.0)*6.49999)));

        // Dot gradient vectors with normalized vector from corners to point
        float g1 = dot(normalize(newPos - f*vec3(1.0,0.0,0.0)), grad1);
        float g2 = dot(normalize(newPos - f*vec3(0.0,1.0,0.0)), grad2);
        float g3 = dot(normalize(newPos - f*vec3(0.0,0.0,1.0)), grad3);

        return vec3(g1,g2,g3);
    }

    return mat.color; 
}

vec3 calculateDiffuseColor( Material mat, vec3 posIntersection, vec3 normalVector ) {
    // Special colors
    if ( mat.special != NONE ) {
        return calculateSpecialDiffuseColor( mat, posIntersection, normalVector ); 
    }
    return vec3( mat.color );
}

// check if position pos in in shadow with respect to a particular light.
// lightVec is the vector from that position to that light
bool pointInShadow( vec3 pos, vec3 lightVec ) {
    Material hitMaterial;
    Intersection intersect;
    Ray ray;
    ray.origin = pos;
    ray.direction = normalize(lightVec);

    // See if ray from position to the light intersects the scene
    float hit_length = rayIntersectScene( ray, hitMaterial, intersect );

    // If intersection occurs at distance smaller than the distance between the 
    // position and the light, the point is in shadow
    if (hit_length > -EPS && hit_length < length(lightVec) + EPS) return true;
    return false;
}

float pointInShadowRatio( vec3 pos, vec3 lightVec ) {
    float count = 0.0; // how many points not in shadow 
    float totalCount = 0.0;
    const int k = 6;

    for (int i = 0; i < k; i++) {
        for (int j = 0; j < k; j++) {
            for (int m = 0; m < k; m++) {
                // Randomly generate new light position
                vec3 tmplightVector = normalize(randLightVector(i, j, m));
                if (tmplightVector.x != -1.0 && tmplightVector.y != -1.0 && tmplightVector.z != -1.0) {
                    if (!pointInShadow( pos, lightVec + tmplightVector )) count = count + 1.0;

                    totalCount = totalCount + 1.0;
                }
            }
        }
    }
    return count/totalCount;
}

vec3 getLightContribution( Light light, Material mat, vec3 posIntersection, vec3 normalVector, vec3 eyeVector, bool phongOnly, vec3 diffuseColor ) {

    vec3 lightVector = light.position - posIntersection;
    
    if ( pointInShadow( posIntersection, lightVector ) ) {
        return vec3( 0.0, 0.0, 0.0 );
    }
    float pointShadowRatio = 1.0;
    // float pointShadowRatio = pointInShadowRatio( posIntersection, lightVector );


    if ( mat.materialType == PHONGMATERIAL || mat.materialType == LAMBERTMATERIAL ) {
        vec3 contribution = vec3( 0.0, 0.0, 0.0 );

        // get light attenuation
        float dist = length( lightVector );
        float attenuation = light.attenuate * dist * dist;

        float diffuseIntensity = max( 0.0, dot( normalVector, lightVector ) ) * light.intensity;
        
        // glass and mirror objects have specular highlights but no diffuse lighting
        if ( !phongOnly ) {
            contribution += diffuseColor * diffuseIntensity * light.color / attenuation;
        }
        
        if ( mat.materialType == PHONGMATERIAL ) {

            vec3 phongTerm = vec3( 0.0, 0.0, 0.0 ); // not implemented yet, so just add black   
            
            vec3 normEye = normalize(eyeVector);
            vec3 normRef = normalize(reflect(lightVector, normalVector));
            phongTerm = mat.specular*pow(dot(normEye,normRef),mat.shininess)*diffuseIntensity / attenuation;

            contribution += phongTerm;
        }

        return contribution*pointShadowRatio;
    }
    else {
        return diffuseColor*pointShadowRatio;
    }

}

vec3 calculateColor( Material mat, vec3 posIntersection, vec3 normalVector, vec3 eyeVector, bool phongOnly ) {
    vec3 diffuseColor = calculateDiffuseColor( mat, posIntersection, normalVector );

    vec3 outputColor = vec3( 0.0, 0.0, 0.0 ); // color defaults to black when there are no lights
    
    for ( int i=0; i<MAX_LIGHTS; i++ ) {

        if( i>=numLights ) break; // because GLSL will not allow looping to numLights
        
        outputColor += getLightContribution( lights[i], mat, posIntersection, normalVector, eyeVector, phongOnly, diffuseColor );
    }
    
    return outputColor;
}

// find reflection or refraction direction ( depending on material type )
vec3 calcReflectionVector( Material material, vec3 direction, vec3 normalVector, bool isInsideObj ) {
    if( material.materialReflectType == MIRRORREFLECT ) {
        return reflect( direction, normalVector );
    }
    // the material is not mirror, so it's glass.
    // compute the refraction direction...

    // see lecture 13 slide ( lighting ) on Snell's law
    // the eta below is eta_i/eta_r
    float eta = ( isInsideObj ) ? 1.0/material.refractionRatio : material.refractionRatio;
    
    float thetacrit = asin(1.0/eta); // critical angle

    // incident angle
    float thetai = acos(-dot(direction,normalVector)/length(direction)/length(normalVector));

    // Catch case for total internal reflection and also make sure input to sine function
    // for calculating the refractive angle is valid
    if (thetai > thetacrit - EPS || sin(thetai)*eta > 1.0 || sin(thetai)*eta < -1.0) {
        return reflect( direction, normalVector );
    }
    float thetar = asin(sin(thetai)*eta);

    // Direction of refracted light
    vec3 T = normalize((eta*cos(thetai) - cos(thetar))*normalVector + eta*direction);
    return T;
}

vec3 traceRay( Ray ray ) {
    Material hitMaterial;
    Intersection intersect;

    vec3 resColor  = vec3( 0.0, 0.0, 0.0 );
    vec3 resWeight = vec3( 1.0, 1.0, 1.0 );
    
    bool isInsideObj = false;

    for ( int depth = 0; depth < MAX_RECURSION; depth++ ) {
        
        float hit_length = rayIntersectScene( ray, hitMaterial, intersect );
            
        if ( hit_length < EPS || hit_length >= INFINITY ) break;

        vec3 posIntersection = intersect.position;
        vec3 normalVector    = intersect.normal;

        vec3 eyeVector = normalize( ray.origin - posIntersection );           
        if ( dot( eyeVector, normalVector ) < 0.0 )
            { normalVector = -normalVector; isInsideObj = true; }
        else isInsideObj = false;

        bool reflective = ( hitMaterial.materialReflectType == MIRRORREFLECT || 
                            hitMaterial.materialReflectType == GLASSREFLECT );
        vec3 outputColor = calculateColor( hitMaterial, posIntersection, normalVector, eyeVector, reflective );

        float reflectivity = hitMaterial.reflectivity;

        // check to see if material is reflective ( or refractive )
        if ( !reflective || reflectivity < EPS ) {
            resColor += resWeight * outputColor;
            break;
        }
        
        // bounce the ray
        vec3 reflectionVector = calcReflectionVector( hitMaterial, ray.direction, normalVector, isInsideObj );
        ray.origin = posIntersection;
        ray.direction = normalize( reflectionVector );

        // add in the color of the bounced ray
        resColor += resWeight * outputColor;
        resWeight *= reflectivity;
    }

    return resColor;
}

void main( ) {
    float cameraFOV = 0.8;
    vec3 direction = vec3( v_position.x * cameraFOV * width/height, v_position.y * cameraFOV, 1.0 );

    Ray ray;
    ray.origin    = vec3( uMVMatrix * vec4( camera, 1.0 ) );
    ray.direction = normalize( vec3( uMVMatrix * vec4( direction, 0.0 ) ) );

    // trace the ray for this pixel
    vec3 res = traceRay( ray );
    
    // paint the resulting color into this pixel
    gl_FragColor = vec4( res.x, res.y, res.z, 1.0 );
}

