/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react'
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
extend({ SavePass, ShaderPass, BlendShader, CopyShader, RenderPass })

const ROTATION_SPEED = 0.02
const MOTION_BLUR_AMOUNT = 0.725

export const Scene = () => {
  const icoRef = useRef<THREE.Mesh>(null)
  
  
  //const { scene, gl, camera } = useThree()
  

  // Animation for icosahedron
  useFrame(() => {
    if (icoRef.current) {
      icoRef.current.rotation.x += ROTATION_SPEED
      icoRef.current.rotation.y += ROTATION_SPEED
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[0, 10, 10]} />

      <Icosahedron ref={icoRef} args={[1, 0]}>
        <meshStandardMaterial color="#4e62f9" />
      </Icosahedron>

      {/*<EffectComposer>
        <R3FShaderPass attachArray="passes" args={[new RenderPass(scene, camera)]} />
        <SavePass attachArray="passes" />
        <R3FShaderPass attachArray="passes" args={[BlendShader, 'tDiffuse1']} uniforms-tDiffuse2-value={null} uniforms-mixRatio-value={MOTION_BLUR_AMOUNT} />
        <R3FShaderPass attachArray="passes" args={[CopyShader]} renderToScreen />
      </EffectComposer>*/}
    </>
  )
}
