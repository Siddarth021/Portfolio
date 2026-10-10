'use client';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import type { Stop } from '@/content/types';
import { useWorld, usePalette } from '@/store/useWorld';
import { MaterialsProvider } from '../parts/kit';
import Board from './Board';
import CameraRig from './CameraRig';
import Car from './Car';
import Road from './Road';
import Stops from './Stops';

function Lights() {
  const pal = usePalette();
  return (
    <>
      <hemisphereLight args={['#ffffff', pal.groundEdge, 0.55]} />
      <directionalLight
        position={[-28, 55, 30]}
        intensity={1.55}
        color="#FFF8EE"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />
      {/* soft studio reflections for the metal parts, generated locally (no downloads) */}
      <Environment resolution={128} frames={1} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
        <Lightformer form="rect" intensity={1} position={[-20, 6, 10]} rotation-y={Math.PI / 2} scale={[20, 8, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[20, 6, -10]} rotation-y={-Math.PI / 2} scale={[20, 8, 1]} />
      </Environment>
    </>
  );
}

export default function Experience({ stops }: { stops: Stop[] }) {
  const pal = usePalette();
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ fov: 40, near: 0.5, far: 500, position: [0, 90, 80] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
      onPointerMissed={() => useWorld.getState().setHovered(-1)}
    >
      <color attach="background" args={[pal.bg]} />
      <fog attach="fog" args={[pal.bg, 120, 260]} />
      <MaterialsProvider palette={pal}>
        <Lights />
        <Board />
        <Road stopCount={stops.length} />
        <Stops stops={stops} />
        <Car stopCount={stops.length} />
      </MaterialsProvider>
      <CameraRig stopCount={stops.length} />
      <EffectComposer multisampling={4}>
        <N8AO aoRadius={2.4} intensity={3} distanceFalloff={0.8} halfRes />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  );
}
