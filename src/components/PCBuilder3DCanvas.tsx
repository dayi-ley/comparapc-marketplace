/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, useGLTF } from '@react-three/drei';
import { Box3, Vector3, Group } from 'three';
import { Cpu, Layers, Tv, HardDrive, Zap, RotateCcw, CheckCircle2, Wrench, MousePointerClick } from 'lucide-react';

const MODELOS = '/models';

interface PiezaDef {
  key: string;
  label: string;
  icon: React.ElementType;
  glb: string;
  pos: [number, number, number];
  size: [number, number, number];
  escala?: number;
  rot?: [number, number, number];
  yaw: number;
  pitch: number;
}

const ANCHO = 1.8;
const ALTO = 3.0;
const PROF = 2.2;

const PIEZAS: PiezaDef[] = [
  { key: 'cpu', label: 'Procesador (CPU)', icon: Cpu, glb: `${MODELOS}/cpu.glb`, pos: [-0.15, 0.85, 0.1], size: [0.55, 0.06, 0.55], rot: [0, 0, 0], yaw: 0, pitch: -0.75 },
  { key: 'ram', label: 'Memoria RAM', icon: Layers, glb: `${MODELOS}/ram.glb`, pos: [-0.5, 0.1, 0.1], size: [0.12, 0.40, 0.5], rot: [0, 80.1, 0], yaw: -1.1, pitch: -0.15 },
  { key: 'gpu', label: 'Tarjeta Grafica (GPU)', icon: Tv, glb: `${MODELOS}/gpu.glb`, pos: [0.2, 0.8, 1.10], size: [1.35, 0.28, 0.42], escala: 1.5, rot: [-Math.PI / 2, 80.1, 0], yaw: 1.1, pitch: -0.15 },
  { key: 'ssd', label: 'Almacenamiento SSD', icon: HardDrive, glb: `${MODELOS}/ssd.glb`, pos: [0.1, -0.35, 0.7], size: [0.3, 0.4, 0.5], rot: [0, 0, 0], yaw: 0, pitch: -0.15 },
  { key: 'psu', label: 'Fuente de Poder (PSU)', icon: Zap, glb: `${MODELOS}/psu.glb`, pos: [0, -0.01, -0.9], size: [1.05, 0.5, 1.0], escala: 1.05, rot: [0, 0, 0], yaw: 0, pitch: 0.55 },
];

const ZONAS: { pos: [number, number, number]; size: [number, number, number]; pieza: string }[] = [
  { pos: [-0.15, 0.85, 0.1], size: [0.6, 0.02, 0.6], pieza: 'cpu' },
  { pos: [0.6, 0.7, 0.1], size: [0.16, 0.75, 0.5], pieza: 'ram' },
  { pos: [0, -0.15, 0.25], size: [1.4, 0.32, 0.45], pieza: 'gpu' },
  { pos: [-0.6, 0.1, 0.7], size: [0.55, 0.02, 0.4], pieza: 'ssd' },
  { pos: [0, -1.15, 0], size: [1.4, 0.55, 1.1], pieza: 'psu' },
];

const REPOSO = { x: -0.12, y: -0.9 };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CHASIS_GLB = `${MODELOS}/case.glb`;
const CHASIS_ALTURA = ALTO;
const CHASIS_ROT: [number, number, number] = [0, 0, 0];
const CHASIS_Y = 0.4;
const ESCALA_PIEZAS = 2.4;

class ModelBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const CajaPieza: React.FC<{ def: PiezaDef }> = ({ def }) => (
  <mesh position={def.pos}>
    <boxGeometry args={def.size} />
    <meshStandardMaterial color="#10b981" metalness={0.4} roughness={0.4} emissive="#065f46" emissiveIntensity={0.4} />
    <Edges color="#6ee7b7" threshold={15} />
  </mesh>
);

const GltfPieza: React.FC<{ def: PiezaDef }> = ({ def }) => {
  const { scene } = useGLTF(def.glb);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const size = new Vector3();
    box.getSize(size);
    const centro = new Vector3();
    box.getCenter(centro);
    clone.position.sub(centro);
    const wrap = new Group();
    wrap.add(clone);
    const objetivo = Math.max(...def.size) * (def.escala ?? ESCALA_PIEZAS);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    wrap.scale.setScalar(objetivo / maxDim);
    if (def.rot) wrap.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
    wrap.position.set(def.pos[0], def.pos[1], def.pos[2]);
    return wrap;
  }, [scene, def]);
  return <primitive object={obj} />;
};

const PiezaModelo: React.FC<{ def: PiezaDef }> = ({ def }) => (
  <ModelBoundary fallback={<CajaPieza def={def} />}>
    <Suspense fallback={<CajaPieza def={def} />}>
      <GltfPieza def={def} />
    </Suspense>
  </ModelBoundary>
);

const CajaChasis: React.FC = () => (
  <mesh>
    <boxGeometry args={[ANCHO, ALTO, PROF]} />
    <meshStandardMaterial color="#0f172a" transparent opacity={0.12} />
    <Edges color="#475569" threshold={15} />
  </mesh>
);

const GltfChasis: React.FC = () => {
  const { scene } = useGLTF(CHASIS_GLB);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const size = new Vector3();
    box.getSize(size);
    const centro = new Vector3();
    box.getCenter(centro);
    clone.position.sub(centro);
    const wrap = new Group();
    wrap.add(clone);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    wrap.scale.setScalar(CHASIS_ALTURA / maxDim);
    wrap.rotation.set(CHASIS_ROT[0], CHASIS_ROT[1], CHASIS_ROT[2]);
    wrap.position.set(0, CHASIS_Y, 0);
    return wrap;
  }, [scene]);
  return <primitive object={obj} />;
};

const Chasis: React.FC = () => (
  <ModelBoundary fallback={<CajaChasis />}>
    <Suspense fallback={<CajaChasis />}>
      <GltfChasis />
    </Suspense>
  </ModelBoundary>
);

const Escena: React.FC<{ activa: string | null; colocadas: Set<string> }> = ({ activa, colocadas }) => {
  const grupo = useRef<any>(null);
  const rot = useRef({ ...REPOSO });
  const drag = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  const zonaActiva = ZONAS.find((z) => z.pieza === activa);

  useFrame(() => {
    if (grupo.current) {
      grupo.current.rotation.x = rot.current.x;
      grupo.current.rotation.y = rot.current.y;
    }
    const ty = zonaActiva ? zonaActiva.pos[1] : 0;
    camera.position.z = lerp(camera.position.z, zonaActiva ? 4.6 : 6.8, 0.06);
    camera.position.y = lerp(camera.position.y, 0.4 + ty * 0.5, 0.06);
    camera.lookAt(0, ty * 0.7, 0);
  });

  return (
    <group
      ref={grupo}
      onPointerDown={(e: any) => { drag.current = true; last.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 }; }}
      onPointerMove={(e: any) => {
        if (!drag.current) return;
        const dx = (e.clientX ?? 0) - last.current.x;
        const dy = (e.clientY ?? 0) - last.current.y;
        rot.current.y += dx * 0.01;
        rot.current.x = Math.max(-1.4, Math.min(1.4, rot.current.x + dy * 0.01));
        last.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
      }}
      onPointerUp={() => { drag.current = false; }}
      onPointerLeave={() => { drag.current = false; }}
    >
      <Chasis />

      {PIEZAS.filter((p) => colocadas.has(p.key)).map((p) => (
        <PiezaModelo key={p.key} def={p} />
      ))}
    </group>
  );
};

export const PCBuilder3DCanvas: React.FC = () => {
  const [colocadas, setColocadas] = useState<Set<string>>(new Set());
  const [activa, setActiva] = useState<string | null>(PIEZAS[0].key);

  const insertar = () => {
    if (!activa) return;
    const nuevas = new Set(colocadas).add(activa);
    setColocadas(nuevas);
    const siguiente = PIEZAS.find((p) => !nuevas.has(p.key));
    setActiva(siguiente?.key ?? null);
  };

  const reiniciar = () => { setColocadas(new Set()); setActiva(PIEZAS[0].key); };

  const completa = colocadas.size === PIEZAS.length;
  const activaDef = PIEZAS.find((p) => p.key === activa);

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-6 space-y-4 select-none">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Gabinete 3D — Ensamblaje Interactivo
        </span>
        <button
          type="button"
          onClick={reiniciar}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reiniciar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        <div className="h-[380px] rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800 cursor-grab active:cursor-grabbing">
          <Canvas camera={{ position: [0, 0.6, 6.5], fov: 42 }} className="touch-none">
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow />
            <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#60a5fa" />
            <Escena activa={activa} colocadas={colocadas} />
          </Canvas>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase">
            <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
            <span>Elige una pieza: el gabinete gira a su ubicacion. Arrastra para girarlo tu; al soltar vuelve a la vista actual.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 min-h-[60px]">
            {PIEZAS.map((p) => {
              const Icon = p.icon;
              const hecha = colocadas.has(p.key);
              const esActiva = p.key === activa;
              return (
                <button
                  key={p.key}
                  type="button"
                  disabled={hecha}
                  onClick={() => (hecha ? undefined : setActiva(p.key))}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                    hecha
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default'
                      : esActiva
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/25 scale-[1.03]'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {completa ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Ensamblaje completo — Nexus Match: Compatible
            </div>
          ) : (
            <button
              type="button"
              onClick={insertar}
              disabled={!activa}
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Insertar {activaDef?.label ?? 'pieza'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};