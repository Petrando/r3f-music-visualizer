/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from "three"
import gsap from 'gsap'
import { useControls } from 'leva'
import { vertexShader } from '../shaders/vertexShader'
import { fragmentShader } from '../shaders/fragmentShader'

import TRACK1 from "../sounds/fire.mp3"
import TRACK2 from "../sounds/Satara - The Game.mp3"

export class Visualizer {
    mesh: THREE.Mesh
    frequencyUniformName: string
    listener: THREE.AudioListener
    sound: THREE.Audio
    loader: THREE.AudioLoader
    analyser: THREE.AudioAnalyser
  
    constructor(mesh: THREE.Mesh, frequencyUniformName: string) {
        this.mesh = mesh
        this.frequencyUniformName = frequencyUniformName
    
        // Ensure the material has the correct uniform
        const material = this.mesh.material as THREE.ShaderMaterial
        material.uniforms[this.frequencyUniformName] = { value: 0 }
    
        // Audio setup
        this.listener = new THREE.AudioListener()
        this.mesh.add(this.listener)
    
        this.sound = new THREE.Audio(this.listener)
        this.loader = new THREE.AudioLoader()
    
        this.analyser = new THREE.AudioAnalyser(this.sound, 32)
    }
  
    load(path: string) {
        this.loader.load(path, (buffer) => {
            this.sound.setBuffer(buffer)
            this.sound.setLoop(true)
            this.sound.setVolume(0.5)            
            this.sound.play()
        })
    }

    stopSong(){
        this.sound.stop()
    }    
  
    getFrequency(): number {
        return this.analyser.getAverageFrequency()
    }
  
    update() {
        const freq = Math.max(this.getFrequency() - 100, 0) / 50

        const material = this.mesh.material as THREE.ShaderMaterial
        //material.uniforms[this.frequencyUniformName].value = freq
        const freqUniform = material.uniforms[this.frequencyUniformName]
        gsap.to(freqUniform, {
            duration: 1.5,
            ease: 'Slow.easeOut',
            value: freq
        })
        //freqUniform.value = freq
        /*
        const freq = Math.max(this.getFrequency() - 10, 0) / 50
    
        // Update the frequency uniform with a smooth animation using GSAP
        const material = this.mesh.material as THREE.ShaderMaterial
        const freqUniform = material.uniforms[this.frequencyUniformName]    
        */
       return freq;
    }
}

export const Scene = () => {
    const icoRef = useRef<THREE.Mesh>(null)
    const [visualizer, setVisualizer] = useState<Visualizer | null>(null)

    const songOptions = ['fire', 'Satara - The Game'] 
    const [{ audioControl, selectSong }, set] = useControls(()=>({         
        audioControl: { value: false, label: 'Play Song' },
        selectSong: { 
            value: 'fire', 
            options: songOptions
        },    
    }))
    const uniforms: { [uniform: string]: THREE.IUniform<any> } = useMemo(() => ({
        uTime: { value: 0 },
    }), []);
        
    // Animation for icosahedron        

    useFrame(( state ) => {
        const t = state.clock.getElapsedTime()

        if (icoRef.current) {
            const material = icoRef.current.material as THREE.ShaderMaterial
                                    
            if(visualizer !== null){
                const freq = visualizer.getFrequency()                
                if(freq > 0){
                    material.uniforms.uTime.value = t
                }
            
                //material.uniforms.uTime.value = freq > 0?t:t/10
                /*
                softGlitch.factor = freq > 0.6?0.7:0.1;
    
                the above line is how to use in threeJs, figure out how to do in r3f
                */
            }else {
                material.uniforms.uTime.value = t/10
            }  
        }
              
    })

    useEffect(()=>{
        set({ audioControl: false })
    }, [selectSong])
            

    useEffect(()=>{        
        if(audioControl){
            if(visualizer === null){
                startVisualizer()
            }
        }else{
            if(visualizer !== null){                
                visualizer.stopSong()
                setVisualizer(null)
            }
        }            
    }, [audioControl, icoRef, visualizer, selectSong])
    
    const startVisualizer = () => {        
        const songIdx = songOptions.findIndex((d) => d.toLowerCase().includes(selectSong.toLowerCase()))
        
        const track = songIdx === 0?TRACK1:TRACK2
        if (icoRef.current && !visualizer) {
            const vis = new Visualizer(icoRef.current, 'uAudioFrequency')
            vis.load(track)
            setVisualizer(vis)
        }
    }
    
    const WIREFRAME_DELTA = 0.015
    return (
        <>
            <group >
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
            </group>
            <EffectComposer>
                <Bloom
                    intensity={0.5} // similar to strength
                    luminanceThreshold={0.0001} // similar to threshold
                    luminanceSmoothing={0.01}  // similar to radius
                    height={300} // adjust based on resolution
                />
            </EffectComposer>
        </>
    )
}
