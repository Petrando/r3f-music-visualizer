/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Scene } from './components/Scene'

const App = () => (
  <div style={{width: "100vw", height: "100vh", position: "relative"}}>
    
       <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <color attach="background" args={["#111827"]} />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={1} position={[0, 10, 10]} />
        <OrbitControls />
        <Suspense fallback={null}>
          <ambientLight />
          <directionalLight />          
          <Scene />
        </Suspense>
      </Canvas>
  </div>
)

export default App
