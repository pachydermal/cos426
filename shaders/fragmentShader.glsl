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

// put any general convenience functions you want up here
// ----------- STUDENT CODE BEGIN ------------
float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}
// ----------- STUDENT CODE END ------------

// forward declaration
float rayIntersectScene( Ray ray, out Material out_mat, out Intersection out_intersect );

// Plane
// this function can be used for plane, triangle, and box
float findIntersectionWithPlane( Ray ray, vec3 norm, float dist, out Intersection intersect ) {
    float a   = dot( ray.direction, norm );
    float b   = dot( ray.origin, norm ) - dist;
    
    if ( a < 0.0 && a > 0.0 ) return INFINITY;
    
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
    // calculate plane normal 
    vec3 t12 = t2 - t1; 
    vec3 t13 = t3 - t1; 
    vec3 norm = normalize(cross(t12, t13)); 

    // Calculate distance from plane to point 
    float dist = dot(t1, norm); 

    float len = findIntersectionWithPlane(ray, norm, dist, intersect); 
    vec3 pt1 = intersect.position - t1; 

    float totalA = dot(cross(t12, t13), norm)/2.0; 
    float alpha = (dot(cross(t12, pt1), norm)/2.0)/totalA; 
    float beta = (dot(cross(pt1, t13), norm)/2.0)/totalA; 

    if (len == INFINITY) return INFINITY; 

    if(!(alpha > 1.0) && !(alpha < 0.0)) {
        if (!(beta > 1.0) && !(beta < 0.0)) {
            if ((beta + alpha) <= 1.0) {
                return len; 
            }
        }
    }
    return INFINITY; 
    // ----------- STUDENT CODE END ------------
}

// Sphere
float findIntersectionWithSphere( Ray ray, vec3 center, float radius, out Intersection intersect ) {   
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 23 lines of code.
    vec3 l = center - ray.origin;
    float tCA = dot(l, ray.direction); 
    if (tCA + EPS < 0.0) return INFINITY; 

    float d2 = dot(l, l) - dot(tCA, tCA);
    float r2 = dot(radius, radius); 
    if (d2 + EPS > r2) return INFINITY; 

    float tHC = sqrt(r2 - d2); 
    float t1 = tCA - tHC; 
    float t2 = tCA + tHC; 

    float t = 0.0; 
    if (t1  > EPS) {
        t = t1; 
    } else if (t2  > EPS) {
        t = t2; 
    } else {
        return INFINITY; 
    }

    vec3 p = ray.origin + (t * ray.direction);
    vec3 normCalc = p - center; 
    vec3 norm = normalize(normCalc);

    intersect.position = rayGetOffset( ray, t );
    intersect.normal   = norm;
    return t; 
    // ----------- STUDENT CODE END ------------
}

float findIntersectionWithFace(Ray ray, vec3 p1, vec3 p2, vec3 p3, out Intersection intersect) {
    // calculate plane normal 
    vec3 v1 = p2 - p1; 
    vec3 v2 = p3 - p1; 
    vec3 norm = normalize(cross(v1, v2)); 

    // Calculate distance from plane to point 
    float dist = dot(p1, norm); 

    float tmpLen = findIntersectionWithPlane(ray, norm, dist, intersect); 

    return tmpLen; 
}

// Box
float findIntersectionWithBox( Ray ray, vec3 pmin, vec3 pmax, out Intersection out_intersect ) {
    // ----------- STUDENT CODE BEGIN ------------
    // pmin and pmax represent two bounding points of the box
    // pmin stores [xmin, ymin, zmin] and pmax stores [xmax, ymax, zmax]
    // ----------- Our reference solution uses 24 lines of code.
    vec3 x1y1z1 = pmin; 
    vec3 x1y1z2 = vec3(pmin.x, pmin.y, pmax.z);
    vec3 x1y2z1 = vec3(pmin.x, pmax.y, pmin.z);
    vec3 x1y2z2 = vec3(pmin.x, pmax.y, pmax.z);
    vec3 x2y1z1 = vec3(pmax.x, pmin.y, pmin.z);
    vec3 x2y2z1 = vec3(pmax.x, pmax.y, pmin.z);
    vec3 x2y1z2 = vec3(pmax.x, pmin.y, pmax.z);
    vec3 x2y2z2 = pmax; 

    float len = INFINITY; 
    vec3 pos; 
    vec3 normal; 
    float tmpLen;
    vec3 p;

    tmpLen = findIntersectionWithFace(ray, x1y1z1, x1y2z1, x2y1z1, out_intersect); 
    p = out_intersect.position;
    if (tmpLen < len) {
        if (p.x >= (pmin.x - EPS) && p.x <= (pmax.x + EPS) && p.y >= (pmin.y - EPS) && p.y <= (pmax.y + EPS) && p.z >= (pmin.z - EPS) && p.z <= (pmax.z + EPS)) {
            len = tmpLen;
            pos = out_intersect.position;
            normal = out_intersect.normal;
        }
    }

    tmpLen = findIntersectionWithFace(ray, x1y2z1, x1y2z2, x2y2z1, out_intersect); 
    p = out_intersect.position;
    if (tmpLen < len) {
        if (p.x >= (pmin.x - EPS) && p.x <= (pmax.x + EPS) && p.y >= (pmin.y - EPS) && p.y <= (pmax.y + EPS) && p.z >= (pmin.z - EPS) && p.z <= (pmax.z + EPS)) {
            len = tmpLen;
            pos = out_intersect.position;
            normal = out_intersect.normal;
        }
    }

    tmpLen = findIntersectionWithFace(ray, x1y1z2, x1y1z1, x1y2z2, out_intersect); 
    p = out_intersect.position;
    if (tmpLen < len) {
        if (p.x >= (pmin.x - EPS) && p.x <= (pmax.x + EPS) && p.y >= (pmin.y - EPS) && p.y <= (pmax.y + EPS) && p.z >= (pmin.z - EPS) && p.z <= (pmax.z + EPS)) {
            len = tmpLen;
            pos = out_intersect.position;
            normal = out_intersect.normal;
        }
    }

    tmpLen = findIntersectionWithFace(ray, x2y2z2, x1y2z2, x2y1z2, out_intersect); 
    p = out_intersect.position;
    if (tmpLen < len) {
        if (p.x >= (pmin.x - EPS) && p.x <= (pmax.x + EPS) && p.y >= (pmin.y - EPS) && p.y <= (pmax.y + EPS) && p.z >= (pmin.z - EPS) && p.z <= (pmax.z + EPS)) {
            len = tmpLen;
            pos = out_intersect.position;
            normal = out_intersect.normal;
        }
    }

    tmpLen = findIntersectionWithFace(ray, x2y1z1, x2y1z2, x1y1z2, out_intersect); 
    p = out_intersect.position;
    if (tmpLen < len) {
        if (p.x >= (pmin.x - EPS) && p.x <= (pmax.x + EPS) && p.y >= (pmin.y - EPS) && p.y <= (pmax.y + EPS) && p.z >= (pmin.z - EPS) && p.z <= (pmax.z + EPS)) {
            len = tmpLen;
            pos = out_intersect.position;
            normal = out_intersect.normal;
        }
    }

    tmpLen = findIntersectionWithFace(ray, x2y2z2, x2y1z2, x2y1z1, out_intersect); 
    p = out_intersect.position;
    if (tmpLen < len) {
        if (p.x >= (pmin.x - EPS) && p.x <= (pmax.x + EPS) && p.y >= (pmin.y - EPS) && p.y <= (pmax.y + EPS) && p.z >= (pmin.z - EPS) && p.z <= (pmax.z + EPS)) {
            len = tmpLen;
            pos = out_intersect.position;
            normal = out_intersect.normal;
        }
    }

    out_intersect.position = pos; 
    out_intersect.normal = normal; 
    return len; // currently reports no intersection
    // ----------- STUDENT CODE END ------------
}  

// Cylinder
float getIntersectOpenCylinder( Ray ray, vec3 center, vec3 axis, float len, float rad, out Intersection intersect ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 31 lines of code.

    //cylinder 
    vec3 a1 = ray.direction - (dot(ray.direction, axis) * axis);
    float a = dot(a1, a1); 

    vec3 deltap = ray.origin - center; 
    vec3 b1 = deltap - (dot(deltap, axis) * axis); 
    float b = 2.0 * dot(a1, b1); 

    float c = dot(b1, b1) - rad*rad;

    if (4.0*a*c > b*b) {
        return INFINITY; 
    }

    float quadbody = sqrt(b*b - 4.0*a*c); 
    float t1 = (-b + quadbody)/(2.0*a); 
    float t2 = (-b - quadbody)/(2.0*a); 

    float t = INFINITY;

    if (t1 < t2 && t1 > EPS) {
        t = t1; 
    } else if (t2 > EPS) {
        t = t2; 
    }

    if (t == INFINITY) return INFINITY; 

    vec3 q = ray.origin + t * ray.direction; 
    vec3 p1 = center; 
    vec3 p2 = center + len * axis; 
    if (dot(axis, (q - p1)) > -EPS && dot(axis, (q - p2)) < EPS) {
        intersect.position = q;
        intersect.normal = normalize( (q - center) - (dot(q - center, axis) * axis));
        return t;
    }

    return INFINITY; // currently reports no intersection
    // ----------- STUDENT CODE END ------------
}

// TODO QUESTION ABOUT THIS ONE
float getIntersectDisc( Ray ray, vec3 center, vec3 norm, float rad, out Intersection intersect ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 15 lines of code.
    // Calculate distance from plane to point 
    float dist = dot(center, norm); 
    float tmpLen = findIntersectionWithPlane(ray, norm, dist, intersect); 
    vec3 p = intersect.position;
    if (dot(p - center, p - center) < (rad*rad)) {
        return tmpLen;
    }

    return INFINITY; // currently reports no intersection
    // ----------- STUDENT CODE END ------------
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
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 31 lines of code.
    axis = normalize(axis);
    float alpha = atan(radius/len); 
    float vdotva = dot(ray.direction, axis); 

    float a1 = dot(cos(alpha),cos(alpha)) * dot((ray.direction - vdotva * axis), (ray.direction - vdotva * axis));
    float a2 = dot(sin(alpha), sin(alpha)) * dot(vdotva, vdotva); 
    float a = a1 - a2; 

    vec3 deltap = ray.origin - apex; 
    float b1 = 2.0 * dot(cos(alpha), cos(alpha)) * dot(ray.direction - vdotva * axis, deltap - dot(deltap, axis)*axis); 
    float b2 = 2.0 * dot(sin(alpha), sin(alpha)) * dot(ray.direction, axis) * dot(deltap, axis); 
    float b = b1 - b2; 

    float c1 = dot(cos(alpha), cos(alpha)) * dot(deltap - dot(deltap, axis)*axis, deltap - dot(deltap, axis)*axis); 
    float c2 = dot(sin(alpha), sin(alpha)) * dot(dot(deltap, axis), dot(deltap, axis));
    float c = c1 - c2; 

    if (4.0*a*c > b*b + EPS) {
        return INFINITY; 
    }

    float quadbody = sqrt(b*b - 4.0*a*c); 
    float t1 = (-b + quadbody)/(2.0*a); 
    float t2 = (-b - quadbody)/(2.0*a); 

    float t = INFINITY;

    if (t1 < t2  && t1 >= EPS) {
        t = t1; 
    } else if (t2 >= EPS) {
        t = t2; 
    }

    if (t == INFINITY) return INFINITY; 

    vec3 q = ray.origin + t * ray.direction; 
    vec3 p1 = apex; 
    vec3 p2 = apex + len * axis; 
    vec3 e = q - apex; 
    if (dot(axis, (q - p1)) >= 0.0 && dot(axis, (q - p2)) <= 0.0) {
        intersect.position = q;
        //intersect.normal = normalize( (q - apex) - (dot(q - apex, axis) * axis));
        intersect.normal = normalize(e - length(e)/(cos(alpha)) * normalize(axis));
        return t;
    }

    return INFINITY; // currently reports no intersection
    // ----------- STUDENT CODE END ------------
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
    // ----------- STUDENT CODE BEGIN ------------
    if ( mat.special == CHECKERBOARD ) {
        // do something here for checkerboard
        // ----------- Our reference solution uses 21 lines of code.
        float value = floor((posIntersection.x/8.0) + EPS) + floor(posIntersection.y/8.0 + EPS) + floor(posIntersection.z/8.0 + EPS);
        if (mod(value, 2.0) == 0.0) {
            mat.color = vec3(1.0,1.0,1.0);
        }
        else {
            mat.color = vec3(0.0,0.0,0.0);
        }
    } 
    else if ( mat.special == MYSPECIAL ) {
        // do something here for myspecial

        float value = floor( pow(posIntersection.x/15.0, 2.0) + pow(posIntersection.y/15.0,2.0) + pow(posIntersection.z/15.0,2.0));
        if (mod(value, 2.0) == 0.0) {
            mat.color = vec3(abs(atan(posIntersection.x/posIntersection.z)),abs(atan(posIntersection.y/posIntersection.x)),abs(atan(posIntersection.z/posIntersection.x)));
        }
        else {
            mat.color = vec3(fract(posIntersection.x/5.0), fract(posIntersection.y/5.0), fract(posIntersection.y));
        }
    }

        // ----------- Our reference solution uses 2 lines of code.
    return mat.color; // special materials not implemented. just return material color.
    // ----------- STUDENT CODE END ------------
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
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 10 lines of code.
    Material hitMaterial;
    Intersection intersect;

    Ray ray;
    ray.origin = pos;
    ray.direction = normalize(lightVec);

    float hit_length = rayIntersectScene( ray, hitMaterial, intersect );

    if (hit_length > EPS && hit_length < (length(lightVec) + EPS)) {
        return true;
    }

    return false;
    // ----------- STUDENT CODE END ------------
}

float pointShadowRatio(vec3 pos, vec3 lightVec) {
    float count = 0.0; 
    float k = 100.0;
    for (int i = 0; i < 100; i++) {
        float seed = float(i);
        float x1 = rand(seed)*2.0 - 1.0; 
        float x2 = rand(x1)*2.0 - 1.0; 

        float x = 2.0 * x1 * sqrt(1.0 - dot(x1, x1) - dot(x2, x2)); 
        float y = 2.0 * x2 * sqrt(1.0 - dot(x1, x1) - dot(x2, x2)); 
        float z = 1.0 - 2.0 * (dot(x1, x1) + dot(x2, x2)); 

        vec3 newLight = vec3(lightVec.x + x, lightVec.y + y, lightVec.z + z);

        if (!pointInShadow(pos, newLight)) {
            count += 1.0; 
        }

    }
    return (count/k); 
}

vec3 getLightContribution( Light light, Material mat, vec3 posIntersection, vec3 normalVector, vec3 eyeVector, bool phongOnly, vec3 diffuseColor ) {

    vec3 lightVector = light.position - posIntersection;
    
    // comment out for soft shadow
    if ( pointInShadow( posIntersection, lightVector ) ) {
        return vec3( 0.0, 0.0, 0.0 );
    }

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
            // ----------- STUDENT CODE BEGIN ------------
            vec3 phongTerm = vec3( 0.0, 0.0, 0.0 ); // not implemented yet, so just add black   
            // ----------- Our reference solution uses 10 lines of code.
            vec3 r = normalize(2.0 * dot(lightVector, normalVector) * normalVector - lightVector);
            phongTerm.x = mat.specular.x * pow(max(dot(eyeVector, r), 0.0), mat.shininess) * diffuseIntensity; 
            phongTerm.y = mat.specular.y * pow(max(dot(eyeVector, r), 0.0), mat.shininess) * diffuseIntensity; 
            phongTerm.z = mat.specular.z * pow(max(dot(eyeVector, r), 0.0), mat.shininess) * diffuseIntensity; 
            // ----------- STUDENT CODE END ------------
            contribution += phongTerm/attenuation;
        }

        // switch these for soft shadow (uncomment second)
        return contribution; 
        //return contribution * pointShadowRatio(posIntersection, lightVector);
    }
    else {
        // switch these for soft shadow (uncomment second)
        return diffuseColor;
        //return diffuseColor * pointShadowRatio(posIntersection, lightVector);
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
    
    // ----------- STUDENT CODE BEGIN ------------
    // see lecture 13 slide ( lighting ) on Snell's law
    // the eta below is eta_i/eta_r
    float eta = ( isInsideObj ) ? 1.0/material.refractionRatio : material.refractionRatio;
    // ----------- Our reference solution uses 11 lines of code.
    float costheta1 = dot(-1.0 * normalVector, direction);
    vec3 refl = 1.0 + 2.0 * costheta1 * normalVector; 

    float sintheta2 = eta * sqrt(1.0 - costheta1 * costheta1);
    float costheta2 = sqrt(1.0 - sintheta2 * sintheta2);

    if (sintheta2 > 1.0) {
        return reflect(direction, normalVector);
    }

    vec3 refr = eta * direction + (eta * costheta1 - costheta2) * normalVector;
    //return refr;
    return refract(direction, normalVector, eta);
    //return reflect(refr, normalVector); // return mirror direction so you can see something
    // ----------- STUDENT CODE END ------------
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

