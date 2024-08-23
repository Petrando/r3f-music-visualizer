/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { Icosahedron, useHelper, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer } from '@react-three/postprocessing'
import { Scene } from './components/Scene'

const App = () => (
  <div style={{width: "100vw", height: "100vh"}}>
       <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <color attach="background" args={["#111827"]} />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={1} position={[0, 10, 10]} />
        <OrbitControls />
        <Suspense fallback={null}>
          <ambientLight />
          <directionalLight />
          {/*<mesh scale={25} position={-1}>
            <planeGeometry />
            <meshStandardMaterial color="#ffffff" />
          </mesh>*/}
          <Scene />
          {/*<EffectComposer>
            <Vignette eskil={false} offset={0.3} darkness={0.9} />
          </EffectComposer>*/}
        </Suspense>
      </Canvas>
  </div>
)

export default App
