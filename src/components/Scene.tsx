/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useMemo } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { Icosahedron } from '@react-three/drei'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { EffectComposer, /*ShaderPass as R3FShaderPass*/ } from '@react-three/postprocessing'
import * as THREE from "three"
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

// Extend R3F with Three.js objects
//extend({ SavePass, ShaderPass, BlendShader, CopyShader, RenderPass })

const ROTATION_SPEED = 0.02
const MOTION_BLUR_AMOUNT = 0.725

const vertexShader = `
varying vec2 vUv;
varying float vPattern;

uniform float uTime;

#define PI 3.14159265358979

vec2 m = vec2(.7,.8);

float hash( in vec2 p ) 
{
    return fract(sin(p.x*15.32+p.y*5.78) * 43758.236237153);
}


vec2 hash2(vec2 p)
{
	return vec2(hash(p*.754),hash(1.5743*p.yx+4.5891))-.5;
}

// Gabor/Voronoi mix 3x3 kernel (some artifacts for v=1.)
float gavoronoi3(in vec2 p)
{    
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float f = 3.*PI;//frequency
    float v = 1.0;//cell variability <1.
    float dv = 0.0;//direction variability <1.
    vec2 dir = m + cos(uTime);//vec2(.7,.7);
    float va = 0.0;
   	float wt = 0.0;
    for (int i=-1; i<=1; i++) 
	for (int j=-1; j<=1; j++) 
	{		
        vec2 o = vec2(i, j)-.5;
        vec2 h = hash2(ip - o);
        vec2 pp = fp + o;
        float d = dot(pp, pp);
        float w = exp(-d*4.);
        wt +=w;
        h = dv*h+dir;//h=normalize(h+dir);
        va += cos(dot(pp,h)*f/v)*w;
	}    
    return va/wt;
}

float noise( vec2 p)
{   
    return gavoronoi3(p);
}

float map(vec2 p){    
    return 2.*abs( noise(p*2.));
}

vec3 nor(in vec2 p)
{
	const vec2 e = vec2(0.1, 0.0);
	return -normalize(vec3(
		map(p + e.xy) - map(p - e.xy),
		map(p + e.yx) - map(p - e.yx),
		1.0));
}

void main() {    
    vec3 light = normalize(vec3(3., 2., -1.));
	float r = dot(nor(uv), light);

    vec3 newPosition = position + normal * clamp(1.0 - r, 0.0, 0.2);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
    
    vUv = uv;
    vPattern = r;
}
`

const fragmentShader = `
varying vec2 vUv;
varying float vPattern;
uniform float uTime;

struct Color { 
    vec3 c;
    float position; //range from 0 to 1
};

#define COLOR_RAMP(inputColors, inputPosition, finalColor) { \
    int index = 0; \
    for(int i = 0; i < inputColors.length() - 1; i++){ \
       Color currentColor = inputColors[i]; \
       Color nextColor = inputColors[i + 1]; \
       bool pointExists = currentColor.position <= inputPosition && inputPosition <= nextColor.position; \
       index = pointExists ? i : index; \
    } \
    Color currentColor = inputColors[index]; \
    Color nextColor = inputColors[index + 1]; \
    vec3 c1 = currentColor.c; \
    vec3 c2 = nextColor.c; \
    float range = nextColor.position - currentColor.position; \
    float lerpFactor = (inputPosition - currentColor.position) / range; \
    finalColor = mix(c1, c2, lerpFactor); \
} \

void main() {
    float time = uTime;
    vec3 color;

    vec3 mainColor = vec3(0.1, 0.4, 0.9);

    mainColor.r *= 0.9 + sin(time) / 3.2;
    mainColor.g *= 1.1 + cos(time / 2.0) / 2.5;
    mainColor.b *= 0.8 + cos(time / 5.0) / 4.0;

    mainColor.rgb += 0.1;

    Color[4] colors = Color[](
        Color(vec3(1), 0.0),
        Color(vec3(1), 0.01),
        Color(mainColor, 0.1),
        Color(vec3(0.01, 0.05, 0.2), 1.0)
    );
    COLOR_RAMP(colors, vPattern, color);
    gl_FragColor = vec4(color, 1);
}
`

export const Scene = () => {
  const icoRef = useRef<THREE.Mesh>(null)

  const uniforms: { [uniform: string]: THREE.IUniform<any> } = useMemo(() => ({
    uTime: { value: 0 },
}), []);
  
  // Animation for icosahedron
  useFrame(( state ) => {
    const t = state.clock.getElapsedTime()

    if (icoRef.current) {
        const material = icoRef.current.material as THREE.ShaderMaterial
        material.uniforms.uTime.value = t
      //icoRef.current.rotation.x += ROTATION_SPEED
      //icoRef.current.rotation.y += ROTATION_SPEED
    }
  })

  const WIREFRAME_DELTA = 0.015
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[0, 10, 10]} />

      <mesh ref={icoRef} >
        <sphereGeometry args={[1, 100, 100]} />
        <shaderMaterial 
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
        />
      </mesh>
      <lineSegments scale={1 + WIREFRAME_DELTA}>
        <sphereGeometry args={[1, 100, 100]} />
        <shaderMaterial 
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
        />
      </lineSegments>

      {/*<EffectComposer>
        <R3FShaderPass attachArray="passes" args={[new RenderPass(scene, camera)]} />
        <SavePass attachArray="passes" />
        <R3FShaderPass attachArray="passes" args={[BlendShader, 'tDiffuse1']} uniforms-tDiffuse2-value={null} uniforms-mixRatio-value={MOTION_BLUR_AMOUNT} />
        <R3FShaderPass attachArray="passes" args={[CopyShader]} renderToScreen />
      </EffectComposer>*/}
    </>
  )
}
